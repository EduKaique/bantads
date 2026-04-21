package com.bantads.auth.dto;
import com.fasterxml.jackson.annotation.JsonProperty;

public class LoginResponseDTO {
    @JsonProperty("access_token")
    private String accessToken;
    
    @JsonProperty("token_type")
    private String tokenType;
    
    private String tipo;
    private UsuarioDTO usuario;

    public LoginResponseDTO(String accessToken, String tipo, UsuarioDTO usuario) {
        this.accessToken = accessToken;
        this.tokenType = "bearer";
        this.tipo = tipo;
        this.usuario = usuario;
    }

    public String getAccessToken() { return accessToken; }
    public void setAccessToken(String accessToken) { this.accessToken = accessToken; }
    public String getTokenType() { return tokenType; }
    public void setTokenType(String tokenType) { this.tokenType = tokenType; }
    public String getTipo() { return tipo; }
    public void setTipo(String tipo) { this.tipo = tipo; }
    public UsuarioDTO getUsuario() { return usuario; }
    public void setUsuario(UsuarioDTO usuario) { this.usuario = usuario; }
}