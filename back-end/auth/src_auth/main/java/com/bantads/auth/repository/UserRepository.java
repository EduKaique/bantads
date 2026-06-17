package com.bantads.auth.repository;

import com.bantads.auth.model.User;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.Optional;

//interface para acessar os dados do usuário no banco de dados
public interface UserRepository extends MongoRepository<User, String> {
    Optional<User> 
    findByEmail(String email);

    Optional<User> findByReferenciaId(String referenciaId);
}