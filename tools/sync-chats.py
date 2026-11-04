#!/usr/bin/env python3
"""Export this project's Claude Code chats to Markdown and sync them with git.

Run from anywhere:
    python3 presentation/tools/sync-chats.py               # export chats + memory, commit, push
    python3 presentation/tools/sync-chats.py --no-push     # export and commit only
    python3 presentation/tools/sync-chats.py --restore-memory   # on a new device: pull, put memory notes in place

Chats are read from ~/.claude/projects/<app folder>/*.jsonl and written to
chats/<date>-<session>.md. Only the readable conversation is kept: your
messages and Claude's replies, plus a one-line note per tool call. Tool output
and system context are left out.
"""
import argparse
import json
import re
import shutil
import subprocess
import sys
from pathlib import Path

REPO = Path(__file__).resolve().parent.parent      # presentation/
APP = REPO.parent                                  # student-picker/
PROJECT = Path.home() / ".claude" / "projects" / re.sub(r"[^A-Za-z0-9]", "-", str(APP))
MEMORY = PROJECT / "memory"
CHATS = REPO / "chats"
MEMORY_COPY = REPO / "claude-memory"

REMINDER = re.compile(r"<system-reminder>.*?</system-reminder>", re.S)
TAGS = re.compile(r"</?(command-name|command-message|command-args|local-command-stdout)>")


def clean(text):
    text = REMINDER.sub("", text)
    text = TAGS.sub("", text)
    return text.strip()


def tool_line(block):
    inp = block.get("input") or {}
    name = block.get("name", "tool")
    what = (inp.get("description") or inp.get("file_path") or inp.get("query")
            or inp.get("action") or inp.get("skill") or "")
    return f"- *{name}*" + (f": {what}" if what else "")


def export(path):
    title, session, started, parts = None, path.stem, None, []
    for raw in path.open(encoding="utf-8"):
        try:
            d = json.loads(raw)
        except json.JSONDecodeError:
            continue
        if d.get("type") == "ai-title":
            title = d.get("aiTitle") or d.get("title") or title
        if d.get("type") not in ("user", "assistant") or d.get("isSidechain") or d.get("isMeta"):
            continue
        started = started or d.get("timestamp")
        content = (d.get("message") or {}).get("content")
        if isinstance(content, str):
            content = [{"type": "text", "text": content}]
        texts, tools = [], []
        for b in content or []:
            if b.get("type") == "text" and clean(b.get("text", "")):
                texts.append(clean(b["text"]))
            elif b.get("type") == "tool_use":
                tools.append(tool_line(b))
            elif b.get("type") == "tool_result":
                r = b.get("content")
                r = r if isinstance(r, str) else " ".join(
                    x.get("text", "") for x in r or [] if isinstance(x, dict))
                if r.startswith("Your questions have been answered"):
                    texts.append("*(answers)* " + r.split(". You can now continue")[0])
        if d["type"] == "user" and texts:
            parts.append("## 🧑 You\n\n" + "\n\n".join(texts))
        elif d["type"] == "assistant" and (texts or tools):
            body = "\n\n".join(texts + (["\n".join(tools)] if tools else []))
            if parts and parts[-1].startswith("## 🤖 Claude"):
                tight = body.startswith("- *") and parts[-1].rsplit("\n", 1)[-1].startswith("- *")
                parts[-1] += ("\n" if tight else "\n\n") + body
            else:
                parts.append("## 🤖 Claude\n\n" + body)
    if not parts:
        return None
    date = (started or "unknown")[:10]
    out = CHATS / f"{date}-{session[:8]}.md"
    head = f"# {title or 'Claude Code session'}\n\n*Session `{session}` · started {started or '?'}*\n"
    out.write_text(head + "\n" + "\n\n---\n\n".join(parts) + "\n", encoding="utf-8")
    return out


def git(*args):
    return subprocess.run(["git", "-C", str(REPO), *args], check=True)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--no-push", action="store_true", help="commit but don't push")
    ap.add_argument("--restore-memory", action="store_true",
                    help="pull, then copy claude-memory/ into this device's Claude memory")
    a = ap.parse_args()

    if a.restore_memory:
        git("pull", "--ff-only")
        if not MEMORY_COPY.is_dir():
            sys.exit("No claude-memory/ in the repo yet.")
        MEMORY.mkdir(parents=True, exist_ok=True)
        for f in MEMORY_COPY.glob("*.md"):
            dest = MEMORY / f.name
            if dest.exists() and dest.read_bytes() != f.read_bytes():
                print(f"kept local {dest.name} (differs from repo copy)")
                continue
            shutil.copy2(f, dest)
            print(f"restored {dest.name}")
        return

    if not PROJECT.is_dir():
        sys.exit(f"No Claude chats found at {PROJECT}")
    CHATS.mkdir(exist_ok=True)
    written = [p for p in map(export, sorted(PROJECT.glob("*.jsonl"))) if p]
    print(f"exported {len(written)} chats to {CHATS.relative_to(APP)}/")
    if MEMORY.is_dir():
        MEMORY_COPY.mkdir(exist_ok=True)
        for f in MEMORY.glob("*.md"):
            shutil.copy2(f, MEMORY_COPY / f.name)
        print(f"copied memory notes to {MEMORY_COPY.relative_to(APP)}/")

    git("add", "chats", "claude-memory")
    if subprocess.run(["git", "-C", str(REPO), "diff", "--cached", "--quiet"]).returncode == 0:
        print("nothing new to commit")
    else:
        git("commit", "-q", "-m", "Sync Claude chats and memory notes")
    if not a.no_push:
        git("push", "-q")
        print("pushed")


if __name__ == "__main__":
    main()
