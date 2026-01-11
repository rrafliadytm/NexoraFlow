import { Injectable, InternalServerErrorException } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class EmailService {
  private transporter: nodemailer.Transporter;

  constructor(private readonly config: ConfigService) {
    this.transporter = nodemailer.createTransport({
      host: this.config.getOrThrow('SMTP_HOST'),
      port: Number(this.config.getOrThrow('SMTP_PORT')),
      secure: Number(this.config.getOrThrow('SMTP_PORT')) === 465,
      auth: {
        user: this.config.getOrThrow('SMTP_USER'),
        pass: this.config.getOrThrow('SMTP_PASS'),
      },
    });
  }

  async sendMail(args: {
    to: string;
    subject: string;
    html: string;
    text?: string;
  }) {
    try {
      const from = this.config.getOrThrow('SMTP_FROM');
      await this.transporter.sendMail({
        from,
        to: args.to,
        subject: args.subject,
        html: args.html,
        text: args.text,
      });
    } catch (e: any) {
      throw new InternalServerErrorException(
        `Failed to send email: ${e?.message ?? e}`,
      );
    }
  }

  async sendOrganizationInvite(
    to: string,
    inviterName: string,
    organizationName: string,
    redirectUrl: string,
  ) {
    return this.sendMail({
      to,
      subject: "You've been invited to join an organization",
      html: `
<!DOCTYPE html>
<html
  lang="en"
  xmlns="http://www.w3.org/1999/xhtml"
  xmlns:v="urn:schemas-microsoft-com:vml"
  xmlns:o="urn:schemas-microsoft-com:office:office"
>
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta http-equiv="X-UA-Compatible" content="IE=edge" />
    <title>Organization Invitation</title>
  </head>
  <body style="margin: 0; padding: 0; background-color: #f4f4f5">
    <!-- Email wrapper -->
    <table
      role="presentation"
      cellspacing="0"
      cellpadding="0"
      border="0"
      width="100%"
      style="background-color: #f4f4f5"
    >
      <tr>
        <td align="center" style="padding: 40px 20px">
          <!-- Email container / Card -->
          <table
            role="presentation"
            cellspacing="0"
            cellpadding="0"
            border="0"
            width="100%"
            style="
              max-width: 480px;
              background-color: #ffffff;
              border-radius: 12px;
            "
            class="email-container"
          >
            <!-- Logo -->
            <tr>
              <td align="center" style="padding: 32px 40px 32px 40px">
                <img
                  src="https://tljzktuztkidcqzeoknr.supabase.co/storage/v1/object/public/brand-assets/logo/email-logo.png"
                  alt="Logo"
                  width="180"
                  style="display: block; max-width: 300px; height: auto"
                />
              </td>
            </tr>

            <!-- Divider -->
            <tr>
              <td style="padding: 0 40px">
                <div style="border-top: 1px solid #e4e4e7"></div>
              </td>
            </tr>

            <!-- Content -->
            <tr>
              <td class="padding" style="padding: 24px 40px 24px 40px">
                <!-- Heading -->
                <h1
                  style="
                    margin: 0 0 16px 0;
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI',
                      Roboto, Helvetica, Arial, sans-serif;
                    font-size: 24px;
                    font-weight: 600;
                    color: #18181b;
                    text-align: center;
                    line-height: 1.3;
                  "
                >
                  You've Been Invited
                </h1>

                <!-- Body text -->
                <p
                  style="
                    margin: 0 0 24px 0;
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI',
                      Roboto, Helvetica, Arial, sans-serif;
                    font-size: 16px;
                    color: #52525b;
                    text-align: center;
                    line-height: 1.6;
                  "
                >
                  You've been invited by <strong>${inviterName}</strong> to join the organization <strong>${organizationName}</strong>. Click the button below to accept the invitation.
                </p>

                <p
                  style="
                    margin: 0 0 24px 0;
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI',
                      Roboto, Helvetica, Arial, sans-serif;
                    font-size: 14px;
                    color: #71717a;
                    text-align: center;
                    line-height: 1.6;
                  "
                >
                  This link will expire in 7 days.
                </p>

                <!-- Button -->
                <table
                  role="presentation"
                  cellspacing="0"
                  cellpadding="0"
                  border="0"
                  width="100%"
                >
                  <tr>
                    <td align="center" style="padding: 8px 0 4px 0">
                      <div>
                        <!--[if mso]>
                          <v:roundrect xmlns:v="urn:schemas-microsoft-com:vml"
                                      xmlns:w="urn:schemas-microsoft-com:office:word"
                                      href="{{ .ConfirmationURL }}"
                                      style="height: 48px;v-text-anchor: middle;width: 220px;"
                                      arcsize="18%"
                                      stroke="f"
                                      fillcolor="#FD6694">
                          <w:anchorlock />
                          <center style="color: #ffffff;font-family: Segoe UI, Arial, sans-serif;font-size: 16px;font-weight: 600;line-height: 48px;">
                        <![endif]-->
                        <a
                          href="{{ .ConfirmationURL }}"
                          target="_blank"
                          style="
                            display: inline-block;
                            padding: 14px 32px;
                            font-family: -apple-system, BlinkMacSystemFont,
                              'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
                            font-size: 16px;
                            font-weight: 600;
                            color: #ffffff;
                            text-decoration: none;
                            border-radius: 8px;
                            background-color: #FD6694;
                            background: linear-gradient(
                              15deg,
                              #FFA600 15%,
                              #FC38FF 85%
                            );
                          "
                        >
                          Accept Invitation
                        </a>
                        <!--[if mso]>
                              Accept Invitation
                            </center>
                        </v:roundrect>
                        <![endif]-->
                      </div>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>

            <!-- Divider -->
            <tr>
              <td style="padding: 0 40px">
                <div style="border-top: 1px solid #e4e4e7"></div>
              </td>
            </tr>

            <!-- Footer -->
            <tr>
              <td style="padding: 24px 40px 32px 40px">
                <p
                  style="
                    margin: 0;
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI',
                      Roboto, Helvetica, Arial, sans-serif;
                    font-size: 13px;
                    color: #a1a1aa;
                    text-align: center;
                    line-height: 1.5;
                  "
                >
                  If you did not expect this invitation, you can safely ignore
                  this email.
                </p>
              </td>
            </tr>
          </table>
          <!-- End Card -->
        </td>
      </tr>
    </table>
  </body>
</html>
      `,
      text: `You’ve been invited. Accept: ${redirectUrl}`,
    });
  }
}
