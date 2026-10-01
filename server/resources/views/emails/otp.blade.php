<!DOCTYPE html>
<html>

<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Kode Verifikasi OTP</title>
</head>

<body style="margin:0;padding:0;background-color:#f4f4f7;font-family:'Segoe UI',Roboto,Arial,sans-serif;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f4f7;padding:40px 0;">
        <tr>
            <td align="center">
                <table width="600" cellpadding="0" cellspacing="0"
                    style="background-color:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
                    <!-- Header -->
                    <tr>
                        <td
                            style="background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%); padding:32px 40px; text-align:center;">
                            <h1 style="color:#ffffff;margin:0;font-size:24px;font-weight:800;letter-spacing:-0.5px;">
                                Menara<span style="color:#ef4444;">Publik</span><span
                                    style="color:#94a3b8;font-weight:400;font-size:14px;">.News</span>
                            </h1>
                            <p
                                style="color:#94a3b8;margin:4px 0 0;font-size:11px;letter-spacing:2px;text-transform:uppercase;">
                                Mengawal Kepentingan Publik</p>
                        </td>
                    </tr>

                    <!-- Body -->
                    <tr>
                        <td style="padding:40px;">
                            <h2 style="color:#1e293b;margin:0 0 8px;font-size:20px;">Halo, {{ $userName }}!</h2>
                            <p style="color:#64748b;margin:0 0 24px;font-size:15px;line-height:1.6;">
                                Berikut adalah kode verifikasi OTP Anda untuk menyelesaikan pendaftaran akun di
                                TitahRakyat.Com:
                            </p>

                            <!-- OTP Code -->
                            <div
                                style="background:#f8fafc;border:2px dashed #e2e8f0;border-radius:12px;padding:24px;text-align:center;margin:0 0 24px;">
                                <p
                                    style="color:#94a3b8;margin:0 0 8px;font-size:12px;letter-spacing:1px;text-transform:uppercase;">
                                    Kode Verifikasi</p>
                                <p
                                    style="color:#1e293b;margin:0;font-size:36px;font-weight:800;letter-spacing:8px;font-family:monospace;">
                                    {{ $otpCode }}</p>
                            </div>

                            <p style="color:#64748b;font-size:13px;line-height:1.6;margin:0 0 8px;">
                                ⏳ Kode ini berlaku selama <strong>10 menit</strong>.
                            </p>
                            <p style="color:#64748b;font-size:13px;line-height:1.6;margin:0;">
                                🔒 Jangan bagikan kode ini kepada siapapun.
                            </p>
                        </td>
                    </tr>

                    <!-- Footer -->
                    <tr>
                        <td style="background:#f8fafc;padding:24px 40px;border-top:1px solid #e2e8f0;">
                            <p style="color:#94a3b8;font-size:12px;margin:0;text-align:center;">
                                Email ini dikirim otomatis oleh TitahRakyat.Com<br>
                                Jika Anda tidak mendaftar, abaikan email ini.
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>

</html>