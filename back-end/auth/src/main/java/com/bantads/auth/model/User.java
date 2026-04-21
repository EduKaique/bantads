package com.bantads.auth.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

@Document(collection = "usuario")
public class User {

    @Id
    private String id;

    @NotBlank(message = "O e-mail é obrigatório")
    @Email(message = "Formato de e-mail inválido")
    @Indexed(unique = true) 
    private String email;

    @NotBlank(message = "A senha é obrigatória")
    private String senha; 

    private TipoUsuario tipo; 

    @Field("referencia_id")
    private String referenciaId; // Guarda o CPF do Cliente/Gerente ou ID do Admin

    public User() {}

    public User(String email, String senha, TipoUsuario tipo, String referenciaId) {
        this.email = email;
        this.senha = senha;
        this.tipo = tipo;
        this.referenciaId = referenciaId;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    
    public String getSenha() { return senha; }
    public void setSenha(String senha) { this.senha = senha; }
    
    public TipoUsuario getTipo() { return tipo; }
    public void setTipo(TipoUsuario tipo) { this.tipo = tipo; }
    
    public String getReferenciaId() { return referenciaId; }
    public void setReferenciaId(String referenciaId) { this.referenciaId = referenciaId; }
}