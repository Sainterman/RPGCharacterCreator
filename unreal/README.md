# Emerald Nightmare → Unreal

The picker exports `client/export/DT_Characters.json`: an array with one row per
character, containing only the contract fields (`id`, `name`, `nature`,
`affiliations`, `paradigm`, `knownMaterials`, `alterations`). Nothing else
crosses to Unreal. There is no live sync: export, then (re)import.

## What the UE 5.8 docs confirm

- [Data Driven Gameplay Elements](https://dev.epicgames.com/documentation/en-us/unreal-engine/data-driven-gameplay-elements-in-unreal-engine):
  import a Data Table from the Content Browser (**Import** → file → **DataTable**
  → row struct). Options: *Ignore Extra Fields*, *Ignore Missing Fields*,
  *Import Key Field* ("if this is empty it uses Name for JSON").
- [Python `unreal.DataTable` 5.8](https://dev.epicgames.com/documentation/en-us/unreal-engine/python-api/class/DataTable?application_version=5.8):
  `import_key_field` and `fill_from_json_file(json_file_path, import_row_struct=None)`.

## What the docs do NOT confirm — verify once in the editor

The 5.8 docs do not describe the JSON layout. Before relying on this, do this
five-minute test:

1. Add `CharacterRow.h` (or an equivalent Blueprint struct) to the game.
2. Import `DT_Characters.json` as a Data Table with that row struct and
   **Import Key Field = `id`**.
3. Check that row `kael` exists and that `affiliations` (array of structs) and
   the `TArray<FName>` fields are filled.
4. Right-click the table → **Export as JSON** and compare with the input file.

If the array of structs (`affiliations`) does not import, bring it back to the
director; the contract is not changed here.

## Option A — manual

1. Content Browser → **Import** → `client/export/DT_Characters.json`.
2. Import As **DataTable**, row type `CharacterRow`, Import Key Field `id`.
3. After re-exporting from the picker: right-click the table → **Reimport**.

## Option B — editor script

With the *Python Editor Script Plugin* enabled, in the Output Log (Python):

```
py "G:/RPGCharacterCreator/unreal/import_characters.py" /Game/Data/DT_Characters "G:/RPGCharacterCreator/client/export/DT_Characters.json"
```

The script sets Import Key Field to `id`, refills the table and saves it.
