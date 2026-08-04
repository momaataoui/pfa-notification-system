package com.pfa.rexel.notification.service;

import com.pfa.rexel.notification.entity.Notification;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.MailException;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
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

        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(notification.getRecipientEmail());
        message.setFrom("Admin Rexel Mini Store <" + smtpUsername + ">");
        message.setReplyTo(ADMIN_EMAIL);
        message.setSubject(notification.getTitle());
        message.setText(notification.getMessage());

        try {
            mailSender.send(message);
            return null;
        } catch (MailException e) {
            log.error("Echec de l'envoi d'email pour la notification {} vers {} : {}",
                    notification.getId(), notification.getRecipientEmail(), e.getMessage());
            return e.getMessage();
        }
    }
}
