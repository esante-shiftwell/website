# Workbook Snapshot

Source: `Fatigue Index_scoring_system_15.xlsm`

## Sheets

- `Parametres score`
- `BILAN`
- `Poste`
- `Planning HEH`
- `Legende HEH`
- `Interne HEH`
- `Planning Manuel`
- `Graphiques brut`
- `1. Heures totales`
- `Planning IDE Lyon Sud`
- `Planning_medecin_LS`
- `Poste_LS`
- `Liste_medecin_LS`
- `Planning_Interne_LS`
- `Liste_interne_LS`
- `2. Duree poste`
- `3. Pauses 24h`
- `4. Heures nocturnes`
- `5. Jours sans travailler`
- `6. Postes nuit`
- `7. Pause minimal`
- `8. Heures sociales`
- `9. Score precedent`
- `Planning medecin original`

## Parameter Cells

- `B6`: `Nbre d'heures travaillées dans la semaine : `
- `C9`: `10`
- `E6`: `40`
- `E8`: `48`
- `E9`: `2`
- `E11`: `2`
- `E12`: `2`
- `E13`: `1`
- `E14`: `0`
- `E18`: `1`
- `E20`: `1`
- `C24`: `11`
- `E24`: `1`
- `E26`: `1`

## Graphiques Brut Rows

### `row_4`

- `J`: `1. Heures travaillées`
- `L`: `2. # Postes longues durées`
- `N`: `3. # Pauses de 24h`
- `P`: `4. # Pauses moins de 11h`
- `R`: `5. # Jours de repos`
- `T`: `6. # Gardes de nuit`
- `V`: `7. h Heures sommeil optimales perdues`
- `X`: `8. h Heures sociales perdues`

### `row_5`

- `C`: `N`
- `D`: `MIN`
- `E`: `Q1`
- `F`: `MEDIANE`
- `G`: `MOYENNE`
- `H`: `Q3`
- `I`: `MAX`
- `J`: `Score`
- `K`: `Brut`
- `L`: `Score`
- `M`: `Brut`
- `N`: `Score`
- `O`: `Brut`
- `P`: `Score`
- `Q`: `Brut`
- `R`: `Score`
- `S`: `Brut`
- `T`: `Score`
- `U`: `Brut`
- `V`: `Score`
- `W`: `Brut`
- `X`: `Score`
- `Y`: `Brut`

### `row_6`

- `B`: `MEDSUD`
- `C`: `=COUNTIFS(#REF!,"*"& B6 &"*",#REF!,"Oui")`
- `D`: `<openpyxl.worksheet.formula.ArrayFormula object at 0x000001738D574EC0>`
- `E`: `<openpyxl.worksheet.formula.ArrayFormula object at 0x000001738D550A50>`
- `F`: `<openpyxl.worksheet.formula.ArrayFormula object at 0x000001738D551950>`
- `G`: `=IF(C6>0,AVERAGEIFS(#REF!,#REF!,"*"& B6 &"*",#REF!,"Oui"),"")`
- `H`: `<openpyxl.worksheet.formula.ArrayFormula object at 0x000001738EBF5940>`
- `I`: `<openpyxl.worksheet.formula.ArrayFormula object at 0x000001738EBF5810>`
- `J`: `=IF(K6<40,0,IF(K6>48,2,1))`
- `K`: `=IF($C6>0,AVERAGEIFS('1. Heures totales'!$D$11:$D$153,'1. Heures totales'!$B$11:$B$153,"*"& $B6 &"*",#REF!,"Oui"),"")`
- `L`: `=IF(M6<2,0,IF(M6>2,2,1))`
- `M`: `=IF($C6>0,AVERAGEIFS('2. Duree poste'!$D$11:$D$102,'2. Duree poste'!$B$11:$B$102,"*"& $B6 &"*",#REF!,"Oui"),"")`
- `N`: `=IF(O6>1,0,IF(O6<1,2,1))`
- `O`: `=IF($C6>0,AVERAGEIFS('3. Pauses 24h'!$D$11:$D$102,'3. Pauses 24h'!$B$11:$B$102,"*"& $B6 &"*",#REF!,"Oui"),"")`
- `P`: `=IF(Q6<1,0,IF(Q6>1,2,1))`
- `Q`: `=IF($C6>0,AVERAGEIFS('7. Pause minimal'!$D$11:$D$102,'7. Pause minimal'!$B$11:$B$102,"*"& $B6 &"*",#REF!,"Oui"),"")`
- `R`: `=IF(S6>1,0,IF(S6<1,2,1))`
- `S`: `=IF($C6>0,AVERAGEIFS('5. Jours sans travailler'!$D$11:$D$102,'5. Jours sans travailler'!$B$11:$B$102,"*"& $B6 &"*",#REF!,"Oui"),"")`
- `T`: `=IF(U6<1,0,IF(U6>2,2,1))`
- `U`: `=IF($C6>0,AVERAGEIFS('6. Postes nuit'!$D$11:$D$102,'6. Postes nuit'!$B$11:$B$102,"*"& $B6 &"*",#REF!,"Oui"),"")`
- `V`: `=IF(W6<8,0,IF(W6>8,2,1))`
- `W`: `=IF($C6>0,AVERAGEIFS('4. Heures nocturnes'!$D$11:$D$102,'4. Heures nocturnes'!$B$11:$B$102,"*"& $B6 &"*",#REF!,"Oui"),"")`
- `X`: `=IF(Y6<6,0,IF(Y6>13,2,1))`
- `Y`: `=IF($C6>0,AVERAGEIFS('8. Heures sociales'!$D$11:$D$102,'8. Heures sociales'!$B$11:$B$102,"*"& $B6 &"*",#REF!,"Oui"),"")`
