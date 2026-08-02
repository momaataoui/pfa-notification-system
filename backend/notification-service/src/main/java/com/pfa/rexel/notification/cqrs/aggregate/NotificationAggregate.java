package com.pfa.rexel.notification.cqrs.aggregate;

import com.pfa.rexel.notification.cqrs.command.CreateNotificationCommand;
import com.pfa.rexel.notification.cqrs.command.MarkAsReadCommand;
import com.pfa.rexel.notification.cqrs.event.NotificationCreatedEvent;
import com.pfa.rexel.notification.cqrs.event.NotificationReadEvent;
import org.axonframework.commandhandling.CommandHandler;
import org.axonframework.eventsourcing.EventSourcingHandler;
import org.axonframework.modelling.command.AggregateIdentifier;
import org.axonframework.modelling.command.AggregateLifecycle;
import org.axonframework.spring.stereotype.Aggregate;

import java.time.LocalDateTime;

// @Aggregate : Axon cree/reconstruit une instance de cette classe a partir de
// TOUS les events passes qui portent son aggregateId, en les rejouant un par
// un via les @EventSourcingHandler ci-dessous (event sourcing = l'etat actuel
// n'est jamais stocke tel quel, il est RECALCULE depuis l'historique des events).
@Aggregate
public class NotificationAggregate {

    @AggregateIdentifier
    private String aggregateId;

    private boolean read;

    // Constructeur vide obligatoire : Axon l'utilise pour instancier l'agregat
    // avant de rejouer les events dessus.
    public NotificationAggregate() {
    }

    // @CommandHandler sur un CONSTRUCTEUR : c'est la commande qui FAIT NAITRE
    // l'agregat (avant ca, aucune instance n'existe pour cet aggregateId).
    @CommandHandler
    public NotificationAggregate(CreateNotificationCommand command) {
        // Ici on pourrait valider (ex: refuser si "channels" est vide) et lever
        // une exception -> la commande echoue, aucun event n'est emis.
        AggregateLifecycle.apply(new NotificationCreatedEvent(
                command.getAggregateId(),
                command.getRecipientType(),
                command.getRecipientEmail(),
                command.getTitle(),
                command.getMessage(),
                command.getChannels(),
                command.getPriority(),
                command.getSourceEventType(),
                LocalDateTime.now()
        ));
    }

    @CommandHandler
    public void handle(MarkAsReadCommand command) {
        if (this.read) {
            return; // deja lue : on ignore, pas d'event redondant
        }
        AggregateLifecycle.apply(new NotificationReadEvent(command.getAggregateId()));
    }

    // @EventSourcingHandler : met a jour l'etat INTERNE de l'agregat (utilise
    // uniquement pour appliquer les regles metier des futures commandes,
    // par ex. "read" ci-dessus). Ce n'est PAS la table de lecture exposee au
    // frontend - ca, c'est le role de NotificationProjection.
    @EventSourcingHandler
    public void on(NotificationCreatedEvent event) {
        this.aggregateId = event.getAggregateId();
        this.read = false;
    }

    @EventSourcingHandler
    public void on(NotificationReadEvent event) {
        this.read = true;
    }
}
