from PyInstaller.building.build_main import Analysis
from PyInstaller.building.api import EXE, PYZ
from os import path

analysis = Analysis(
    scripts=['main.py'],
    pathex=[path.abspath('.')],
    binaries=None,
    datas=[('.env', '.')],
    hiddenimports=None,
    hookspath=None,
    hooksconfig=None,
    excludes=None,
    runtime_hooks=None,
    cipher=None,
    win_no_prefer_redirects=None,
    win_private_assemblies=None,
    noarchive=None,
    module_collection_mode=None,
    optimize=0
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
    name='',
    icon='icon.ico',
    version=None,
    manifest=None,
    embed_manifest=True,
    resources=...,
    strip=False,
    upx_exclude=...,
    runtime_tmpdir=None,
    contents_directory="_internal",
    append_pkg=True,
    uac_admin=False,
    uac_uiaccess=False,
    argv_emulation=False,
    target_arch=None,
    codesign_identity=None,
    entitlements_file=None,
    upx=False,
    cdict=None
)
