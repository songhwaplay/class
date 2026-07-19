Attribute VB_Name = "Module39"
Sub fourth단위_문제()
Attribute fourth단위_문제.VB_ProcData.VB_Invoke_Func = " \n14"
'
' fourth단위_문제 Macro
'

'
    Range("E2,E4,E6,E8,E10,E12").Select
    Range("E12").Activate
   
    Range("E2,E4,E6,E8,E10,E12,E14,E16").Select
    Range("E16").Activate
  
    Range("E2,E4,E6,E8,E10,E12,E14,E16,E18,E20,E22,E24,G22,I22,I18,G18,K18").Select
    Range("K18").Activate
    
    With Selection.Font
        .ThemeColor = xlThemeColorDark1
        .TintAndShade = 0
    End With
    
    Range("H3").Select
End Sub
Sub fourth단위_답()
Attribute fourth단위_답.VB_ProcData.VB_Invoke_Func = " \n14"
'
' fourth단위_답 Macro
'

'
    Range("E2,E4,E6,E8,E10,E12,E14,E16").Select
    Range("E16").Activate
   
    Range("E2,E4,E6,E8,E10,E12,E14,E16,E18,G18,I18,K18,I22,G22,E24,E22,E20").Select
    Range("E20").Activate
  
    With Selection.Font
        .Color = -4165632
        .TintAndShade = 0
    End With
   
    Range("H3").Select
End Sub
