Attribute VB_Name = "Module27"
Sub sixth소수A_답()
Attribute sixth소수A_답.VB_ProcData.VB_Invoke_Func = " \n14"
'
' sixth소수A_답 매크로
'

'
    Range("C35,F35,I35,I29,F29,C29,C23,F23,I23,I17,F17,C17,C11,F11,I11,I5,F5,C5,a1"). _
        Select
          Range("a1").Activate

    With Selection.Font
        .Color = -11489280
        .TintAndShade = 0
    End With
End Sub
Sub sixth소수A_문제()
Attribute sixth소수A_문제.VB_ProcData.VB_Invoke_Func = " \n14"
'
' sixth소수A_문제 매크로
'

'
    Range("I35,F35,C35,C29,F29,I29,I23,F23,C23,C17,F17,I17,I11,F11,C11,I5,F5,C5,a1"). _
        Select
    Range("a1").Activate
    
    With Selection.Font
        .ThemeColor = xlThemeColorDark1
        .TintAndShade = 0
    End With

End Sub
