package com.pfa.rexel.notification.service;

import com.pfa.rexel.notification.entity.Notification;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;

import java.util.List;
import java.util.Map;

@Service
public class SmsSender {

    private static final Logger log = LoggerFactory.getLogger(SmsSender.class);
    private static final String VONAGE_SMS_URL = "https://rest.nexmo.com/sms/json";

    private final RestTemplate restTemplate = new RestTemplate();

    @Value("${vonage.api-key:}")
    private String apiKey;

    @Value("${vonage.api-secret:}")
    private String apiSecret;

    @Value("${vonage.from:RexelStore}")
    private String from;

    /**
     * @return null si l'envoi a reussi, sinon la raison de l'echec
     */
    public String send(Notification notification) {
        if (notification.getRecipientPhone() == null) {
            String reason = "Pas de numero de telephone renseigne pour ce destinataire";
            log.warn("SMS non envoye pour la notification {} : {}", notification.getId(), reason);
            return reason;
        }

        if (apiKey.isBlank() || apiSecret.isBlank()) {
            String reason = "Identifiants Vonage non configures (VONAGE_API_KEY / VONAGE_API_SECRET)";
            log.warn("SMS non envoye pour la notification {} : {}", notification.getId(), reason);
            return reason;
        }

        try {
            MultiValueMap<String, String> form = new LinkedMultiValueMap<>();
            form.add("api_key", apiKey);
            form.add("api_secret", apiSecret);
            form.add("to", notification.getRecipientPhone());
            form.add("from", from);
            form.add("text", notification.getMessage());

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);

            @SuppressWarnings("unchecked")
            Map<String, Object> response = restTemplate.postForObject(
                    VONAGE_SMS_URL, new HttpEntity<>(form, headers), Map.class);

            @SuppressWarnings("unchecked")
            List<Map<String, Object>> messages = response != null
                    ? (List<Map<String, Object>>) response.get("messages") : null;

            if (messages == null || messages.isEmpty()) {
                return "Reponse Vonage invalide";
            }

            Map<String, Object> first = messages.get(0);
            String status = String.valueOf(first.get("status"));

            if ("0".equals(status)) {
                return null;
            }

            String errorText = String.valueOf(first.get("error-text"));
            log.error("Echec de l'envoi SMS pour la notification {} vers {} : {}",
                    notification.getId(), notification.getRecipientPhone(), errorText);
            return errorText;
        } catch (Exception e) {
            log.error("Echec de l'envoi SMS pour la notification {} vers {} : {}",
                    notification.getId(), notification.getRecipientPhone(), e.getMessage());
            return e.getMessage();
        }
    }
}
