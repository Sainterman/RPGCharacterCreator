"""Reimport the Emerald Nightmare character export into a Data Table.

Run inside the Unreal Editor (Python Editor Script Plugin enabled), from the
Output Log console in "Python" mode:

    py "<path>/unreal/import_characters.py" /Game/Data/DT_Characters "<path>/client/export/DT_Characters.json"

The Data Table must already exist with its row struct set (see README.md).
Uses only APIs documented in the Unreal Python 5.8 reference:
DataTable.import_key_field and DataTable.fill_from_json_file.
"""

import sys

import unreal


def main(table_path: str, json_path: str) -> None:
    table = unreal.EditorAssetLibrary.load_asset(table_path)
    if not isinstance(table, unreal.DataTable):
        raise RuntimeError(f"{table_path} is not a DataTable")

    # Row names come from the contract's "id" field instead of "Name".
    table.set_editor_property("import_key_field", "id")

    if not table.fill_from_json_file(json_path):
        raise RuntimeError(f"Import failed for {json_path}; check the Output Log")

    unreal.EditorAssetLibrary.save_loaded_asset(table)
    unreal.log(f"Imported {json_path} into {table_path}")


if __name__ == "__main__":
    if len(sys.argv) != 3:
        raise SystemExit("usage: import_characters.py <DataTablePath> <JsonPath>")
    main(sys.argv[1], sys.argv[2])
