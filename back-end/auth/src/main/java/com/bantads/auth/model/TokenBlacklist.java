package com.bantads.auth.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "token_blacklist")
public class TokenBlacklist {
    
    @Id
    private String id;
    private String token;

    public TokenBlacklist() {}

    public TokenBlacklist(String token) {
        this.token = token;
    }

    public String getToken() { return token; }
    public void setToken(String token) { this.token = token; }
}