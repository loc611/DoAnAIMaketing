$files = Get-ChildItem -Path src -Recurse -Filter *.jsx

foreach ($file in $files) {
    $content = Get-Content -Path $file.FullName -Raw -Encoding UTF8
    
    $replacements = @{
        'Tuy[^a-zA-Z0-9\s<>]+t Tác' = 'Tuyệt Tác'
        'Huy[^a-zA-Z0-9\s<>]+n Thoại' = 'Huyền Thoại'
        'Đ[^a-zA-Z0-9\s<>]+nh Hình' = 'Định Hình'
        'Thế Gi[^a-zA-Z0-9\s<>]+i M' = 'Thế Giới M'
        'M[^a-zA-Z0-9\s<>]+i\.' = 'Mới.'
        'Công Ngh[^a-zA-Z0-9\s<>]+' = 'Công Nghệ'
        'Thu Cũ Đ[^a-zA-Z0-9\s<>]+i Mới' = 'Thu Cũ Đổi Mới'
        'Đ[^a-zA-Z0-9\s<>]+i Mới' = 'Đổi Mới'
        'Titan Đ[^a-zA-Z0-9\s<>]+n' = 'Titan Đen'
        'Titan Tr[^a-zA-Z0-9\s<>]+ng' = 'Titan Trắng'
        'Titan T[^a-zA-Z0-9\s<>]+ Nhiên' = 'Titan Tự Nhiên'
        'Titan Sa M[^a-zA-Z0-9\s<>]+c' = 'Titan Sa Mạc'
        'Đậm ch[^a-zA-Z0-9\s<>]+t' = 'Đậm chất'
        'M[^a-zA-Z0-9\s<>]+N H[^a-zA-Z0-9\s<>]+NH' = 'MÀN HÌNH'
        'PIN & S[^a-zA-Z0-9\s<>]+C' = 'PIN & SẠC'
        'DUNG LƯ[^a-zA-Z0-9\s<>]+NG' = 'DUNG LƯỢNG'
        'Quay V[^a-zA-Z0-9\s<>]+ ' = 'Quay Về '
        'Tr[^a-zA-Z0-9\s<>]+n quyền' = 'Trọn quyền'
        'Đi[^a-zA-Z0-9\s<>]+u khiển' = 'Điều khiển'
        'li[^a-zA-Z0-9\s<>]+n mạch' = 'liền mạch'
        'nhi[^a-zA-Z0-9\s<>]+u hơn' = 'nhiều hơn'
        'Đ[^a-zA-Z0-9\s<>]+ược thiết' = 'Được thiết'
        'b[^a-zA-Z0-9\s<>]+t phá' = 'bứt phá'
        'm[^a-zA-Z0-9\s<>]+i ranh' = 'mọi ranh'
        'v[^a-zA-Z0-9\s<>]+ tốc' = 'về tốc'
        'v[^a-zA-Z0-9\s<>]+ sức' = 'về sức'
        'nhảy v[^a-zA-Z0-9\s<>]+t v[^a-zA-Z0-9\s<>]+' = 'nhảy vọt về'
        'th[^a-zA-Z0-9\s<>]+ hệ' = 'thế hệ'
        'gi[^a-zA-Z0-9\s<>]+ ' = 'giờ '
        'v[^a-zA-Z0-9\s<>]+i ' = 'với '
        'b[^a-zA-Z0-9\s<>]+n bỉ' = 'bền bỉ'
        'TÃ¡c' = 'Tác'
        'Thoáº¡i' = 'Thoại'
        'Tháº§n' = 'Thần'
        'CÃ´ng' = 'Công'
        'Tuyá»‡t' = 'Tuyệt'
    }

    $modified = $false
    foreach ($key in $replacements.Keys) {
        if ($content -match $key) {
            $content = $content -replace $key, $replacements[$key]
            $modified = $true
        }
    }

    if ($modified) {
        [System.IO.File]::WriteAllText($file.FullName, $content, [System.Text.Encoding]::UTF8)
        Write-Host "Fixed $($file.FullName)"
    }
}
