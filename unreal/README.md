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

## Verified in the editor (UE 5.8, 2026-10-10)

The 5.8 docs do not describe the JSON layout, so it was tested in the game:
the import **passes and the contract does not change**.

- Row struct in the game: `FENCharacterRow` (with `FENCharacterAffiliation`) in
  `Source/EmeraldNightmare/Characters/ENCharacterRow.h`: a copy of
  `CharacterRow.h` with the `EMERALDNIGHTMARE_API` macro and the `EN` prefix,
  fields unchanged. In the UI and in Python the row type is `ENCharacterRow`.
- Asset: `/Game/Data/DT_Characters`, Import Key Field `id`, *Ignore Extra/Missing
  Fields* unchecked. Row `kael` imports with its 2 affiliations (id + role),
  3 known materials and 3 alterations, with no field warnings.
- `import_characters.py` works as is.

> **Never reimport a JSON exported from Unreal.** Unreal's **Export as JSON**
> leaves out every property named like the row key (`id`), also inside nested
> structs, so affiliations come out without their `id`. The tool's
> `client/export/DT_Characters.json` is always the source of truth.

## Option A — manual

1. Content Browser → **Import** → `client/export/DT_Characters.json`.
2. Import As **DataTable**, row type `ENCharacterRow`, Import Key Field `id`;
   save it as `/Game/Data/DT_Characters`.
3. After re-exporting from the picker: right-click the table → **Reimport**.

## Option B — editor script

With the *Python Editor Script Plugin* enabled, in the Output Log (Python):

```
py "G:/RPGCharacterCreator/unreal/import_characters.py" /Game/Data/DT_Characters "G:/RPGCharacterCreator/client/export/DT_Characters.json"
```

The script sets Import Key Field to `id`, refills the table and saves it.
