###############
### IMPORTS ###
###############

from PyInstaller.building.build_main import Analysis
from PyInstaller.building.api import EXE, PYZ
from os import path
from pathlib import Path
from shutil import copytree, rmtree, copy2

#####################
### CONFIGURATION ###
#####################

EXE_NAME = ""

#################
### PACKAGING ###
#################

analysis = Analysis(
    scripts=['main.py'],
    pathex=[path.abspath('.')],
    binaries=None,
    datas=[],
    hiddenimports=[],
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
    icon='icon.ico',
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

###############
### CLEANUP ###
###############

resources = Path("resources").resolve()
dist = Path("dist").resolve()
bin = Path("bin").resolve()
build = Path("build").resolve()
if not bin.exists():
    if resources.exists():
        copytree(resources, dist / "resources", dirs_exist_ok=True)
    dist.rename(dist.parent / "bin")
else:
    copy2(dist / f"{EXE_NAME}.exe", bin / f"{EXE_NAME}.exe")
    rmtree(dist)
rmtree(build)
