#!/usr/bin/env bash
# Rebuild the final presentation (Notebook theme) and the Bold Signal variant.
# Usage: bash alternatif-ecc/build/build.sh   (from anywhere)
set -euo pipefail
B=$(cd "$(dirname "$0")" && pwd); A=$(dirname "$B"); P=$(dirname "$A")
ALL=$(python3 -c "import json,sys;print(','.join(json.load(open(sys.argv[1]))['order']))" "$P/deck/project/deck.json")
python3 -I "$B/build_ecc.py" "$B/ecc_template.html" "$P/deck/project/slides" "$A/final-sunum.html" "$ALL" "$B/notebook.css" "$B/paper.js"
python3 -I "$B/build_ecc.py" "$B/ecc_template.html" "$P/deck/project/slides" "$A/sunum.html" "$ALL"
echo "Built: $A/final-sunum.html (final) and $A/sunum.html (Bold Signal variant)"
