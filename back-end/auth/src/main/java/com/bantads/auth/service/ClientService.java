package com.bantads.back_end.service;

import com.bantads.back_end.dto.ClientDTO;
import java.util.List;

public interface ClientService {
    
    ClientDTO createClient(ClientDTO clientDTO);

    ClientDTO getClientById(Long id);

    List<ClientDTO> getAllClients();

    ClientDTO updateClient(Long id, ClientDTO clientDTO);

    void deleteClient(Long id);
}