// Reference row struct for the Emerald Nightmare character Data Table.
// This file is NOT compiled here. The game uses a copy of it as
// FENCharacterRow in Source/EmeraldNightmare/Characters/ENCharacterRow.h.
// Property names match the JSON contract exactly.
//
// Open decisions (see unreal/README.md):
// - FName vs. UENUM for Paradigm, Role, KnownMaterials and Alterations.
// - Whether the row keeps an "id" property or relies only on the row name.
// Rename EMERALD_API to the game module's API macro.

#pragma once

#include "CoreMinimal.h"
#include "Engine/DataTable.h"
#include "CharacterRow.generated.h"

USTRUCT(BlueprintType)
struct FCharacterAffiliation
{
	GENERATED_BODY()

	UPROPERTY(EditAnywhere, BlueprintReadOnly)
	FName id;

	UPROPERTY(EditAnywhere, BlueprintReadOnly)
	FName role;
};

USTRUCT(BlueprintType)
struct EMERALD_API FCharacterRow : public FTableRowBase
{
	GENERATED_BODY()

	// The row name is the contract "id" (Import Key Field = id).

	UPROPERTY(EditAnywhere, BlueprintReadOnly)
	FString name;

	UPROPERTY(EditAnywhere, BlueprintReadOnly)
	FString nature;

	UPROPERTY(EditAnywhere, BlueprintReadOnly)
	TArray<FCharacterAffiliation> affiliations;

	UPROPERTY(EditAnywhere, BlueprintReadOnly)
	FName paradigm;

	UPROPERTY(EditAnywhere, BlueprintReadOnly)
	TArray<FName> knownMaterials;

	UPROPERTY(EditAnywhere, BlueprintReadOnly)
	TArray<FName> alterations;
};
