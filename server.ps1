$port = 8080
$listener = New-Object System.Net.Sockets.TcpListener([System.Net.IPAddress]::Any, $port)
$listener.Start()
Write-Host "TCP Server listening on port $port..."

while($true) {
    if (!$listener.Pending()) {
        Start-Sleep -Milliseconds 50
        continue
    }
    
    $client = $listener.AcceptTcpClient()
    $stream = $client.GetStream()
    
    # Read just enough to get the GET line
    $buffer = New-Object byte[] 1024
    $bytesRead = $stream.Read($buffer, 0, 1024)
    $request = [System.Text.Encoding]::ASCII.GetString($buffer, 0, $bytesRead)
    
    if ($request -match "^GET\s+([^\s]+)\s+HTTP") {
        $url = $matches[1].Split('?')[0]
        if ($url -eq "/") { $url = "/index.html" }
        
        $filePath = Join-Path (Get-Location).Path $url.Replace("/", "\")
        
        if (Test-Path $filePath -PathType Leaf) {
            $content = [System.IO.File]::ReadAllBytes($filePath)
            $ext = [System.IO.Path]::GetExtension($filePath).ToLower()
            $contentType = "text/plain"
            if ($ext -eq ".html") { $contentType = "text/html" }
            elseif ($ext -eq ".css") { $contentType = "text/css" }
            elseif ($ext -eq ".js") { $contentType = "application/javascript" }
            elseif ($ext -eq ".jpg") { $contentType = "image/jpeg" }
            
            $headers = "HTTP/1.1 200 OK`r`n"
            $headers += "Content-Type: $contentType`r`n"
            $headers += "Content-Length: $($content.Length)`r`n"
            $headers += "Connection: close`r`n"
            $headers += "Access-Control-Allow-Origin: *`r`n`r`n"
            
            $headerBytes = [System.Text.Encoding]::ASCII.GetBytes($headers)
            $stream.Write($headerBytes, 0, $headerBytes.Length)
            $stream.Write($content, 0, $content.Length)
        } else {
            $headers = "HTTP/1.1 404 Not Found`r`nConnection: close`r`n`r`n"
            $headerBytes = [System.Text.Encoding]::ASCII.GetBytes($headers)
            $stream.Write($headerBytes, 0, $headerBytes.Length)
        }
    }
    
    $stream.Close()
    $client.Close()
}
