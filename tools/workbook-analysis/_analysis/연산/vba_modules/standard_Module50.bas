Attribute VB_Name = "Module50"
Sub third덧셈뺄셈_답()
Attribute third덧셈뺄셈_답.VB_ProcData.VB_Invoke_Func = " \n14"
'
' third덧셈뺄셈_답 매크로
'

'
    Range("B5,D5,F5,H5,H11,F11,D11,B11").Select
    Range("B11").Activate
    
    Range("B5,D5,F5,H5,H11,F11,D11,B11,B17,D17,F17,H17,H23,F23,D23,B23").Select
    Range("B23").Activate
    
    With Selection.Font
        .Color = -11489280
        .TintAndShade = 0
    End With
    
    Range("B5").Select
End Sub
Sub third덧셈뺄셈_문제()
Attribute third덧셈뺄셈_문제.VB_ProcData.VB_Invoke_Func = " \n14"
'
' third덧셈뺄셈_문제 매크로
'

'
    Range("B5,D5,F5,H5,H11,F11,D11,B11,B17,D17,F17,H17").Select
    Range("H17").Activate
   
    Range("B5,D5,F5,H5,H11,F11,D11,B11,B17,D17,F17,H17,H23,F23,D23,B23").Select
    Range("B23").Activate
    With Selection.Font
        .ThemeColor = xlThemeColorDark1
        .TintAndShade = 0
    End With
    
    Range("B5").Select
End Sub
