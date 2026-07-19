Attribute VB_Name = "Module25"

Sub fifth분수대소_문제()
'


    Range( _
        "D7:D8,D16:D17,D25:D26,D34:D35,D43:D44,D52:D53,D61:D62,D70:D71,D79:D80,D88:D89" _
        ).Select
    Range("D88").Activate

    With Selection.Font
        .ThemeColor = xlThemeColorDark1
        .TintAndShade = 0
    End With

    Range("A1").Select
End Sub

Sub fifth분수대소_답()
'

'

    Range( _
        "D7:D8,D16:D17,D25:D26,D34:D35,D43:D44,D52:D53,D61:D62,D70:D71,D79:D80,D88:D89" _
        ).Select
    Range("D88").Activate

    With Selection.Font
        .Color = -11489280
        .TintAndShade = 0
    End With

    Range("A1").Select
End Sub
