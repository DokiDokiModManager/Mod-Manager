# Doki Doki Mod Manager Ren'Py Script

init 999 python:
    import sys
    sys.stderr.flush()
    if config.name == "Doki Doki Literature Club!" and build.itch_project == "teamsalvato/ddlc" and build.name == "DDLC":
        sys.stderr.write("ddmm-modded:no")
    else:
        sys.stderr.write("ddmm-modded:yes")
    sys.stderr.flush()
