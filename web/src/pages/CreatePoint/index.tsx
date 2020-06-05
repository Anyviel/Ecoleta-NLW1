import React, { useEffect, useState, ChangeEvent, FormEvent } from 'react';
import { Map, TileLayer, Marker } from 'react-leaflet';
import { LeafletMouseEvent } from 'leaflet';
import Api from '../../services/Api';
import axios from 'axios';

import { Link, useHistory } from 'react-router-dom';
import { FiArrowLeft } from 'react-icons/fi';

import './styles.css';
import logo from '../../assets/logo.svg';

interface Item {
  id: number;
  title: string;
  image_url: string;
}

interface UF {
  sigla: string;
  nome: string;
}

interface City {
  id: number;
  nome: string;
}

const CreatePoint = () => {
  const [items, setItems] = useState<Item[]>([]);
  const [uf, setUf] = useState<UF[]>([]);
  const [cidade, setCidade] = useState<City[]>([]);

  const [initialPosition, setinitialPosition] = useState<[number, number]>([0, 0])

  const [formData, setformData] = useState({
    name: '',
    email: '',
    whatsapp: ''
  })

  const [selectedUf, setSelectedUf] = useState('0');
  const [selectedCity, setSelectedCity] = useState('0');
  const [selectedItem, setSelectedItem] = useState<number[]>([]);
  const [selectedPosition, setselectedPosition] = useState<[number, number]>([0, 0]);

  const history = useHistory();

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(position => {
      const { latitude, longitude } = position.coords;

      setinitialPosition([latitude, longitude]);
    })
  })

  useEffect(() => {
    Api.get('items').then(response => {
      setItems(response.data);
    })
  }, [])

  useEffect(() => {
    axios.get('https://servicodados.ibge.gov.br/api/v1/localidades/estados').then(response => {
      setUf(response.data);
    })
  }, []);

  useEffect(() => {
    if (selectedUf === '0') {
      return
    }
    axios.get(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${selectedUf}/municipios`).then(response => {
      setCidade(response.data);
    })

    console.log('Mudou Negro: ', selectedUf)
  }, [selectedUf]);

  function handleSelectUf(event: ChangeEvent<HTMLSelectElement>) {
    const uf = event.target.value;
    setSelectedUf(uf)
  }

  function handleSelectCities(event: ChangeEvent<HTMLSelectElement>) {
    const city = event.target.value;
    setSelectedCity(city)
  }

  function handleMapClick(event: LeafletMouseEvent) {
    setselectedPosition([
      event.latlng.lat, 
      event.latlng.lng
    ])
  }

  function handleInputChange(event: ChangeEvent<HTMLInputElement>) {
    const { name, value } = event.target;

    setformData({ ...formData, [name]: value})
  }

  function handleSelecteItem(id: number) {
    const alreadySelected = selectedItem.findIndex(item => item === id);
    if (alreadySelected >= 0){
      const filteredItem = selectedItem.filter(item => item !== id);
      setSelectedItem(filteredItem);
    } else {
      setSelectedItem([ ...selectedItem, id ])
    }
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();

    const { name, email, whatsapp} = formData;
    const uf = selectedUf;
    const city = selectedCity;
    const [latitude, longitude] = selectedPosition;
    const items = selectedItem;

    const data = {
      name,
      email,
      whatsapp,
      uf,
      city,
      latitude,
      longitude,
      items,
    }

    await Api.post('points', data)
    alert('Ponto de Coleta Criado!')
    history.push('/')
  }

  return (
    <div id="page-create-point">
      <header>
        <img src={logo} alt="Ecoleta"/>
        <Link to="/">
          <FiArrowLeft />
          Voltar para Home
        </Link>
      </header>

      <form onSubmit={handleSubmit}>
        <h1>Cadastro do <br />Ponto de Coleta</h1>

        <fieldset>
          <legend>
            <h2>Dados</h2>
          </legend>
        </fieldset>

        <div className="field">
          <label htmlFor="name">Nome da Entidade</label>
          <input 
            type="text"
            name="name"
            id="name"
            onChange={handleInputChange}
          />
        </div>

        <div className="field-group">
          <div className="field">
            <label htmlFor="email">E-Mail</label>
            <input 
              type="email"
              name="email"
              id="email"
              onChange={handleInputChange}
            />
          </div>
            <div className="field">
            <label htmlFor="whatsapp">Whatsapp</label>
            <input 
              type="text"
              name="whatsapp"
              id="whatsapp"
              onChange={handleInputChange}
            />
          </div>
        </div>

        <fieldset>
          <legend>
            <h2>Endereço</h2>
            <span>Selecione o Endereço no Mapa</span>
          </legend>

          <Map center={initialPosition} zoom={15} onclick={handleMapClick}>
            <TileLayer
              attribution='&amp;copy <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <Marker position={selectedPosition} />
          </Map>

          <div className="field-group">
            <div className="field">
              <label htmlFor="uf">Estado (UF)</label>
              <select name="uf" value={selectedUf} id="uf" onChange={handleSelectUf}>
                <option value="0" >Seleciona uma UF</option>
                {uf.map(uf => (
                  <option key={uf.sigla} value={uf.sigla}>{uf.nome} ({uf.sigla})</option>
                ))}
              </select>
            </div>
            <div className="field">
              <label htmlFor="uf">Cidade</label>
              <select name="city" value={selectedCity} id="city" onChange={handleSelectCities}>
                <option value="0">Seleciona uma Cidade</option>
                {cidade.map(city => (
                  <option key={city.id} value={city.nome}>{city.nome}</option>
                ))}
              </select>
            </div>
          </div>
        </fieldset>

        <fieldset>
          <legend>
            <h2>Itens de Coleta</h2>
            <span>Selecione um ou mais Itens abaixo</span>
          </legend>

          <ul className="items-grid">
            {items.map(item => (
              <li key={item.id} onClick={() => handleSelecteItem(item.id)} 
              className={selectedItem.includes(item.id) ? 'selected' : ''}>
                <img src={item.image_url} alt={item.title}/>
                <span>{item.title}</span>
              </li>
            ))}
          </ul>
        </fieldset>

        <button type="submit">Cadastrar Ponto de Coleta</button>
      </form>
    </div>
  )
}

export default CreatePoint;