package com.pfa.rexel.store.exception;

public class EmailAlreadyUsedException extends RuntimeException {

    public EmailAlreadyUsedException(String email) {
        super("Cet email est deja utilise : " + email);
    }
}
