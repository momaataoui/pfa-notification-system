package com.pfa.rexel.notification.config;

import lombok.RequiredArgsConstructor;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.messaging.support.MessageHeaderAccessor;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.stereotype.Component;

// @Component : ce filtre devient un bean Spring, injectable dans WebSocketConfig
@Component
@RequiredArgsConstructor
public class StompAuthInterceptor implements ChannelInterceptor {
    // ChannelInterceptor : interface Spring qui permet d'intercepter CHAQUE message
    // qui transite sur le "canal" WebSocket, avant qu'il soit traite (un peu comme
    // JwtAuthFilter interceptait chaque requete HTTP, mais ici pour les messages STOMP).

    private final JwtDecoder jwtDecoder;
    // JwtDecoder : deja fourni automatiquement par Spring depuis qu'on a configure
    // oauth2ResourceServer (Phase 2) avec l'issuer-uri de Keycloak. On le reutilise
    // ici pour valider un token "a la main", car les WebSockets ne passent PAS par
    // le filtre de securite HTTP habituel.

    @Override
    public Message<?> preSend(Message<?> message, MessageChannel channel) {
        // preSend() s'execute AVANT que le message ne soit envoye plus loin dans le
        // pipeline -> c'est le bon endroit pour verifier/rejeter/enrichir un message.

        StompHeaderAccessor accessor = MessageHeaderAccessor.getAccessor(message, StompHeaderAccessor.class);
        // L'accessor permet de lire les en-tetes STOMP du message (proche de
        // HttpServletRequest pour une requete HTTP classique).

        if (accessor != null && StompCommand.CONNECT.equals(accessor.getCommand())) {
            // On ne s'interesse qu'a la trame CONNECT : c'est la toute premiere
            // trame envoyee par le client quand il ouvre la connexion WebSocket.
            // Les trames suivantes (SEND, SUBSCRIBE...) n'ont pas besoin d'etre
            // re-authentifiees, la connexion reste ouverte et identifiee une fois pour toutes.

            String authHeader = accessor.getFirstNativeHeader("Authorization");
            // "Native header" = un en-tete personnalise que le CLIENT ajoute lui-meme
            // dans la trame STOMP CONNECT (equivalent du header HTTP Authorization,
            // mais ici c'est nous qui devons aller le chercher manuellement).

            if (authHeader != null && authHeader.startsWith("Bearer ")) {
                String token = authHeader.substring(7);
                // "Bearer " fait 7 caracteres -> on recupere seulement le token JWT.

                Jwt jwt = jwtDecoder.decode(token);
                // Valide la signature + l'expiration du token (leve une exception si invalide,
                // ce qui rejettera implicitement la connexion).

                String email = jwt.getClaimAsString("email");
                // Recupere l'identite de l'utilisateur depuis le token, comme partout ailleurs.

                accessor.setUser(() -> email);
                // Associe cet email a la connexion WebSocket en cours, via un Principal
                // "fait maison" (une simple lambda qui retourne l'email comme nom).
                // C'est CETTE association qui permettra plus tard a PushNotificationSender
                // de cibler precisement cette connexion avec convertAndSendToUser(email, ...).
            }
        }

        return message;
        // Indispensable : on retourne le message pour qu'il continue son chemin normalement
        // (comme filterChain.doFilter() pour un filtre HTTP classique).
    }
}
