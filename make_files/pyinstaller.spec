###############
### IMPORTS ###
###############

from PyInstaller.building.build_main import Analysis
from PyInstaller.building.api import EXE, PYZ
from os import path
from pathlib import Path
from shutil import copy2, copytree, rmtree, make_archive, move
import re
import time

#####################
### CONFIGURATION ###
#####################

EXE_NAME = ""
MODULE_NAME = ""
BOOT_SCRIPT = ["main.py"]
EXTRAS_LIST = [
    {"src": Path(f"{MODULE_NAME}/resources").resolve(), "dest_name": ""}
]
ICON = "icon.ico"
HIDDEN_IMPORTS = []

########################
### BEFORE PACKAGING ###
########################

DIST = Path("dist").resolve()
RELEASES_DIR = Path("releases").resolve()
if DIST.exists():
    rmtree(DIST)

#################
### PACKAGING ###
#################

analysis = Analysis(
    scripts=BOOT_SCRIPT,
    pathex=[path.abspath('.')],
    binaries=None,
    datas=[],
    hiddenimports=HIDDEN_IMPORTS,
    hookspath=None,
    hooksconfig=None,
    excludes=None,
    runtime_hooks=None,
    cipher=None,
    win_no_prefer_redirects=False,
    win_private_assemblies=False,
    noarchive=False,
    module_collection_mode=None,
    optimize=2
)
pyz = PYZ(
    analysis.pure,
    name=None,
    cipher=None
)
exe = EXE(
    pyz,
    analysis.scripts,
    analysis.binaries,
    analysis.datas,
    exclude_binaries = False,
    bootloader_ignore_signals = False,
    console=True,
    hide_console=None,
    disable_windowed_traceback = False,
    debug=False,
    name=EXE_NAME,
    icon=ICON,
    version=None,
    manifest=None,
    embed_manifest=True,
    resources=[],
    strip=False,
    upx_exclude=[],
    runtime_tmpdir=None,
    contents_directory='_internal',
    append_pkg=True,
    uac_admin=False,
    uac_uiaccess=False,
    argv_emulation=False,
    target_arch=None,
    codesign_identity=None,
    entitlements_file=None,
    upx=True,
    cdict=None
)

#######################
### AFTER PACKAGING ###
#######################

for extra in EXTRAS_LIST:
    src = extra["src"]
    if not src.exists():
        hint = extra.get("hint")
        raise FileNotFoundError(f"{src} não encontrado{f' - {hint}' if hint else '.'}")
    dest = DIST / (extra.get("dest_name") or src.name)
    dest.parent.mkdir(parents=True, exist_ok=True)
    if src.is_dir():
        copytree(src, dest, dirs_exist_ok=True)
    else:
        copy2(src, dest)

#########################
### RELEASE PACKAGING ###
#########################

RELEASES_DIR.mkdir(exist_ok=True)
def with_retry(fn, attempts=150, delay_seconds=2):
    for attempt in range(1, attempts + 1):
        try:
            return fn()
        except PermissionError:
            if attempt == attempts:
                raise
            if attempt % 10 == 0:
                print(f"Aguardando lock liberar (tentativa {attempt}/{attempts})...")
            time.sleep(delay_seconds)

def next_release_tag() -> str:
    versions = []
    for zip_path in RELEASES_DIR.glob("*.zip"):
        match = re.match(r"^v(\d+)\.(\d+)\.(\d+)\.zip$", zip_path.name)
        if match:
            versions.append(tuple(int(part) for part in match.groups()))
    if not versions:
        return "v1.0.0"
    major, minor, patch = max(versions)
    return f"v{major}.{minor}.{patch + 1}"

tag = next_release_tag()
zip_path = with_retry(lambda: Path(make_archive(str(Path(tag).resolve()), "zip", root_dir=str(DIST))))
with_retry(lambda: move(str(zip_path), str(RELEASES_DIR / zip_path.name)))
print(f"Release empacotado: releases/{zip_path.name}")
