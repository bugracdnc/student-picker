# Student Picker — User Guide

*[Türkçe sürüm](kullanim-kilavuzu.md)*

Student Picker chooses who answers next, at random and **fairly**: nobody is picked twice until everyone present has had a turn. You can also take attendance, give students plus/minus points, and keep several classes.

No internet and no account needed. Everything is stored only on the computer (or smart board) you use it on.

> **Note:** This is an **early test (alpha) version**. Please take backups now and then (see [Keeping your data safe](#keeping-your-data-safe)).

---

## Contents

1. [Installing](#installing)
2. [Creating your first class](#creating-your-first-class)
3. [Picking a student](#picking-a-student)
4. [Attendance: Present / Absent / Skip](#attendance-present--absent--skip)
5. [Giving points](#giving-points)
6. [Several classes](#several-classes)
7. [Keeping your data safe](#keeping-your-data-safe)
8. [Moving to another board](#moving-to-another-board)
9. [Updating and removing](#updating-and-removing)
10. [Questions & answers](#questions--answers)

---

## Installing

Choose **one** of the options below. If you are not sure, start with **Option 1**; if it asks for an administrator password you don't have, use **Option 2**.

### Option 1 — With the Package Installer (recommended)

The easiest way if you know the computer's administrator password.

1. Open this page: **<https://github.com/bugracdnc/student-picker/releases>**
2. Under the newest release, in the **Assets** list, click the file whose name ends in **`.deb`** (e.g. `student-picker_0.1.0.alpha.2_all.deb`). It downloads.
3. Open your **Downloads** folder and **double-click** the file.
4. In the **Pardus Package Installer** window press **Install**, and enter the administrator password if asked.
5. Done! Open the applications menu and type **Student Picker** to find it.

> To put an icon on the desktop: right-click **Student Picker** in the applications menu and choose **Add to Desktop** (if your menu doesn't offer this, Option 2 creates the desktop icon for you).

### Option 2 — One line, no administrator password

School smart boards often don't come with an administrator password. This option doesn't need one; you just copy and paste a single line.

1. Open the applications menu, type **Terminal** (on Pardus in Turkish: **Uçbirim**) and open it. A text window appears.
2. Copy the whole line below:

   ```
   wget -qO- https://raw.githubusercontent.com/bugracdnc/student-picker/master/packaging/pardus/kur.sh | sh
   ```

3. **Right-click** inside the Terminal window and choose **Paste** (or press **Ctrl + Shift + V**), then press **Enter**.
4. After a few seconds you'll see *"Done!"*. You can close the Terminal window.
5. The **Student Picker** icon is now on your desktop and in the applications menu.

### Option 3 — Use it without installing

1. Download **`student-picker.html`** from the [releases page](https://github.com/bugracdnc/student-picker/releases).
2. Double-click it; it opens in your web browser.

Always open the file from **the same place** (for example, move it into your Documents folder first and open it from there). If you move the file or open it in a different browser, your classes may not show up — in that case [restore your backup](#restoring-a-backup).

---

## Creating your first class

The app opens in Turkish when the computer is set to Turkish. Switch language any time with the **TR / EN** buttons at the top right.

1. Press **Create your first class** (or the **+** next to **Classes** on the left).
2. Give it a name, e.g. *9-A Mathematics*, and press **Create class**.
3. In the **Students** section on the right, press **Add students**.
4. Type the names, one student per line:

   ```
   101 Ada Lovelace
   102 Alan Turing
   103 Grace Hopper
   ```

5. Press **Add students**.

> **Tip:** You can copy a class list from e-Okul, a spreadsheet or a document and paste it straight into this box. Each line becomes one student; number and name stay together.

---

## Picking a student

- Tap the big **Pick a student** button in the middle. Names spin for a moment and the chosen student's name appears in large letters.
- With a keyboard, pressing **Space** does the same.
- A student who has been picked won't be picked again this round. The bar at the bottom shows how many have had a turn and how many are **still waiting**.
- When everyone present has had a turn, a **Start new round** button appears and puts everyone back in. You can also restart early with **New round**.

Pressed something by mistake? Use the **Undo** button that appears at the bottom of the screen.

---

## Attendance: Present / Absent / Skip

Every student card has three buttons:

| Button | Meaning |
|---|---|
| **Present** | In class and can be picked. (New students start as Present.) |
| **Absent** | Not in class; won't be picked. |
| **Skip** | In class but shouldn't be picked today (e.g. at the nurse, presenting). |

To mark the whole class at once, press the **⋯** (three dots) next to **Students** and choose **Mark all present** or **Mark all absent**.

Attendance stays as you left it until you change it, so update it at the start of the next lesson if needed.

---

## Giving points

- Under the picked student's name you'll see **−1** and **+1** buttons — reward a good answer, or take a point away.
- Every student card also has **−** and **+** buttons.
- The **Leaderboard** at the bottom ranks students by points and shows how many turns each has had.
- To reset points: in the class's **⋯** menu, choose **Reset scores & turns**.

---

## Several classes

Tap a class in the **Classes** list on the left to switch to it. Each class's **⋯** menu offers:

- **Rename**
- **Duplicate…** — A new class with the same students (e.g. when you teach two subjects to the same group). Tick **Start fresh** to give the copy zero points.
- **Export as CSV** — Downloads the class list with points as a file that opens in Excel/LibreOffice.
- **Delete class** — Changed your mind? Press **Undo** right after.

To move a student to another class, use **Move to class…** in the **⋯** on the student's card. To work with many students at once, press **Select multiple** next to **Students**.

---

## Keeping your data safe

Your classes are stored inside the web browser on this computer. That means:

- Always open the app **from the same icon**.
- **Clearing the browser's history / cookies / site data** can erase your classes.
- School boards may be wiped at the end of term.

**Take a backup once a month (or after big changes):**

1. Press **Backup** at the top right.
2. A file called `student-picker-DATE.json` is saved to your **Downloads** folder.
3. Copy it to a USB stick or email it to yourself.

### Restoring a backup

1. Press **Import** at the top right and choose the backup file. (You can also drag the file onto the app window.)
2. If the app already has classes, it asks:
   - **Add as new classes** — keeps your current classes and adds the ones from the backup.
   - **Replace all** — removes everything currently there and puts the backup in its place.

---

## Moving to another board

1. On the first board, press **Backup** and copy the file to a USB stick.
2. [Install](#installing) Student Picker on the other board.
3. Press **Import** and choose the file from the USB stick.

To share just one class, use **Export as JSON** in that class's **⋯** menu. Give the file to a colleague and they can add it with **Import**.

---

## Updating and removing

**To update**, simply install again the same way (Option 1: download the new `.deb` and double-click it; Option 2: paste the same line again). Your classes are kept.

**To remove:**

- Installed with Option 1: open **Pardus Software Center**, search for *student-picker* and press **Remove**. If it isn't listed there, type `sudo apt remove student-picker` in the Terminal, press Enter and enter the administrator password.
- Installed with Option 2: paste this line into the Terminal and press Enter:

  ```
  wget -qO- https://raw.githubusercontent.com/bugracdnc/student-picker/master/packaging/pardus/kaldir.sh | sh
  ```

---

## Questions & answers

**Clicking the desktop icon shows an "untrusted application" warning.**
Right-click the icon and choose **Allow Launching** (or **Mark as trusted**). You only need to do this once.

**My classes are gone!**
The app was probably opened in a different browser or from a different place. Try opening it from the usual icon first. If that doesn't help, [restore your latest backup](#restoring-a-backup).

**Can the same student be picked again and again?**
No. In a round, everyone is picked at most once. When the round ends, press **Start new round**.

**The screen is too dark / too bright.**
Use the **sun / moon** icon at the top right to switch between light and dark. Light mode is easier to read in sunny classrooms.

**Does it work without internet?**
Yes. After installing, no internet is needed.

**Is student information sent anywhere?**
No. Everything stays on this computer only.

**I found a problem / have an idea.**
Please tell me directly, or report it at <https://github.com/bugracdnc/student-picker/issues>. A screenshot helps a lot.
