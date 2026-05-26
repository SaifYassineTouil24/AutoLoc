<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width">
<style>
  body { margin:0; padding:0; background:#f4f6f9; font-family: Arial, sans-serif; color:#1a1a2e; }
  .wrapper { max-width:560px; margin:30px auto; background:#fff; border-radius:12px; overflow:hidden; box-shadow:0 2px 8px rgba(0,0,0,0.08); }
  .header { background:linear-gradient(135deg,#1a1a2e,#16213e); padding:28px 32px; }
  .header .logo { color:#fff; font-size:22px; font-weight:bold; letter-spacing:2px; }
  .header .tagline { color:#a0aec0; font-size:11px; margin-top:4px; }
  .body { padding:28px 32px; }
  .title { font-size:20px; font-weight:bold; color:#1a1a2e; margin-bottom:8px; }
  .subtitle { color:#718096; font-size:13px; margin-bottom:24px; }
  .card { background:#f7fafc; border:1px solid #e2e8f0; border-radius:8px; padding:16px 20px; margin:16px 0; }
  .card .row { display:flex; justify-content:space-between; font-size:13px; padding:5px 0; border-bottom:1px solid #edf2f7; }
  .card .row:last-child { border:none; }
  .card .row .label { color:#718096; }
  .card .row .value { font-weight:600; color:#2d3748; }
  .total { background:#1a1a2e; color:#fff; border-radius:8px; padding:14px 20px; display:flex; justify-content:space-between; align-items:center; margin:16px 0; }
  .total .tlabel { font-size:12px; color:#a0aec0; }
  .total .tvalue { font-size:20px; font-weight:bold; color:#f6ad55; }
  .btn { display:inline-block; background:#2b6cb0; color:#fff; padding:12px 28px; border-radius:8px; text-decoration:none; font-weight:bold; font-size:14px; margin:16px 0; }
  .footer { background:#f7fafc; border-top:1px solid #e2e8f0; padding:16px 32px; text-align:center; font-size:11px; color:#a0aec0; }
  .badge { display:inline-block; padding:3px 10px; border-radius:20px; font-size:11px; font-weight:bold; }
  .badge-green { background:#c6f6d5; color:#276749; }
  .badge-blue  { background:#bee3f8; color:#2c5282; }
  .badge-red   { background:#fed7d7; color:#c53030; }
</style>
</head>
<body>
<div class="wrapper">
  <div class="header">
    <div class="logo">AutoLoc</div>
    <div class="tagline">Gestion Location Automobile · Maroc</div>
  </div>
  <div class="body">
    @yield('content')
  </div>
  <div class="footer">
    AutoLoc Gestion · 123 Boulevard Mohammed V, Casablanca · +212 5 22 00 00 00<br>
    Cet email a été envoyé automatiquement, merci de ne pas y répondre.
  </div>
</div>
</body>
</html>
