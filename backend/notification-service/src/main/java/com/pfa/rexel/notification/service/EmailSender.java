package com.pfa.rexel.notification.service;

import com.pfa.rexel.notification.entity.Notification;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ClassPathResource;
import org.springframework.mail.MailException;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class EmailSender {

    private static final Logger log = LoggerFactory.getLogger(EmailSender.class);
    private static final String ADMIN_EMAIL = "moomaataoui@gmail.com";

    private final JavaMailSender mailSender;

    @Value("${spring.mail.username}")
    private String smtpUsername;

    /**
     * @return null si l'envoi a reussi, sinon la raison de l'echec
     */
    public String send(Notification notification) {
        if (notification.getRecipientEmail() == null) {
            String reason = "Pas de destinataire unique (BROADCAST/GROUP non supporte par ce canal)";
            log.warn("Email non envoye pour la notification {} : {}", notification.getId(), reason);
            return reason;
        }

        try {
            MimeMessage mimeMessage = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, true, "UTF-8");

            helper.setTo(notification.getRecipientEmail());
            helper.setFrom("Admin Rexel Store <" + smtpUsername + ">");
            helper.setReplyTo(ADMIN_EMAIL);
            helper.setSubject(notification.getTitle());
            helper.setText(buildHtmlBody(notification), true);
            helper.addInline("logo", new ClassPathResource("rexel-logo.png"));

            mailSender.send(mimeMessage);
            return null;
        } catch (Exception e) {
            log.error("Echec de l'envoi d'email pour la notification {} vers {} : {}",
                    notification.getId(), notification.getRecipientEmail(), e.getMessage());
            return e.getMessage();
        }
    }

    private String buildHtmlBody(Notification notification) {
        return "<div style=\"font-family:Arial,Helvetica,sans-serif;max-width:480px;margin:0 auto;\">"
                + "<div style=\"background:linear-gradient(135deg,#0f2a66,#4a82c4);padding:24px;text-align:center;border-radius:10px 10px 0 0;\">"
                + "<img src=\"cid:logo\" alt=\"Rexel Store\" width=\"48\" height=\"48\" style=\"display:block;margin:0 auto 8px;border-radius:8px;\"/>"
                + "<span style=\"color:#ffffff;font-size:18px;font-weight:bold;letter-spacing:0.5px;\">REXEL STORE</span>"
                + "</div>"
                + "<div style=\"background:#ffffff;border:1px solid #e5e7eb;border-top:none;border-radius:0 0 10px 10px;padding:28px 24px;\">"
                + "<h2 style=\"margin:0 0 16px;color:#111827;font-size:17px;\">" + escape(notification.getTitle()) + "</h2>"
                + "<p style=\"color:#374151;font-size:14px;line-height:1.6;margin:0 0 4px;\">Bonjour,</p>"
                + "<p style=\"color:#374151;font-size:14px;line-height:1.6;\">" + escape(notification.getMessage()) + "</p>"
                + "<p style=\"color:#374151;font-size:14px;line-height:1.6;margin-top:24px;\">Cordialement,<br/><strong>L'équipe Rexel Store</strong></p>"
                + "</div>"
                + "<p style=\"text-align:center;color:#9ca3af;font-size:11px;margin-top:14px;\">Ceci est un message automatique, merci de ne pas y répondre directement.</p>"
                + "</div>";
    }

    private String escape(String text) {
        return text == null ? "" : text.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;");
    }
}
