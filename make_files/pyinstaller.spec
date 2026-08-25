###############
### IMPORTS ###
###############

from PyInstaller.building.build_main import Analysis
from PyInstaller.building.api import EXE, PYZ
from os import path
from pathlib import Path
from shutil import copytree, rmtree

#####################
### CONFIGURATION ###
#####################

EXE_NAME = ""
MODULE_NAME = ""
BOOT_SCRIPT = ["main.py"]
EXTRAS_LIST = [
    Path(f"{MODULE_NAME}/resources").resolve()
    # More here...
]
ICON = None
HIDDEN_IMPORTS = []

########################
### BEFORE PACKAGING ###
########################

DIST = Path("dist").resolve()
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
    if extra.exists():
        copytree(extra, DIST / extra.name, dirs_exist_ok=True)
