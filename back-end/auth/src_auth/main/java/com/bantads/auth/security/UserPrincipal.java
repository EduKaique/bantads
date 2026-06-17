package com.bantads.auth.security; 
import java.util.Collection;
import java.util.Collections;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import com.bantads.auth.model.User;

public class UserPrincipal implements UserDetails {

    private String referenciaId;
    private String email;
    private String nome;
    private String password;
    private Collection<? extends GrantedAuthority> authorities;

    public UserPrincipal(User user) {
        this.referenciaId = user.getReferenciaId();
        this.email = user.getEmail();
        this.nome = user.getNome();
        this.password = user.getSenha(); 
        
        this.authorities = Collections.singletonList(
            new SimpleGrantedAuthority(user.getTipo().name())
        );
    }

    public UserPrincipal(String referenciaId, String email, String tipo, String nome) {
        this.referenciaId = referenciaId;
        this.email = email;
        this.nome = nome;
        this.password = null; 
        
        this.authorities = Collections.singletonList(
            new SimpleGrantedAuthority(tipo)
        );
    }

    public String getReferenciaId() { return referenciaId; }
    public String getNome() { return nome; }
    @Override public String getUsername() { return email; }
    @Override public String getPassword() { return password; }
    @Override public Collection<? extends GrantedAuthority> getAuthorities() { return authorities; }
    @Override public boolean isAccountNonExpired() { return true; }
    @Override public boolean isAccountNonLocked() { return true; }
    @Override public boolean isCredentialsNonExpired() { return true; }
    @Override public boolean isEnabled() { return true; }
}