import React, { useState } from 'react';
import axios from 'axios';
import './UyeEkle.css';
import { useNavigate } from 'react-router-dom';
import { FiArrowLeft } from 'react-icons/fi';

const UyeEkle = () => {
    const navigate = useNavigate();
    const [yeniUye, setYeniUye] = useState({
        UyeAdi: '',
        UyeSoyadi: '',
        TCKimlik: '',
        Telefon: '',
        Email: '',
        UyelikDurumu: 'Aktif'  // Varsayılan değer
    });
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ text: '', type: '' });

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setYeniUye(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage({ text: '', type: '' });

        try {
            const response = await axios.post('http://localhost:3001/api/uyeler', yeniUye);
            setMessage({ text: 'Üye başarıyla eklendi!', type: 'success' });
            setYeniUye({
                UyeAdi: '',
                UyeSoyadi: '',
                TCKimlik: '',
                Telefon: '',
                Email: '',
                UyelikDurumu: 'Aktif'
            });
        } catch (error) {
            setMessage({ 
                text: error.response?.data?.message || 'Üye eklenirken bir hata oluştu.', 
                type: 'error' 
            });
        } finally {
            setLoading(false);
        }
    };

    const handleBackClick = () => {
        navigate('/panel');
    };

    return (
        <div className="uye-ekle-container">
            <div className="page-header">
                <button className="back-button" onClick={handleBackClick}>
                    <FiArrowLeft /> Ana Panele Dön
                </button>
                <h2>Yeni Üye Ekle</h2>
            </div>
            
            {message.text && (
                <div className={`message ${message.type}`}>
                    {message.text}
                </div>
            )}

            <form onSubmit={handleSubmit} className="uye-form">
                <div className="form-group">
                    <label htmlFor="TCKimlik">T.C. Kimlik No:</label>
                    <input
                        type="text"
                        id="TCKimlik"
                        name="TCKimlik"
                        value={yeniUye.TCKimlik}
                        onChange={handleInputChange}
                        required
                        minLength="11"
                        maxLength="11"
                        pattern="[0-9]{11}"
                        placeholder="11 haneli TC Kimlik No"
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="UyeAdi">Adı:</label>
                    <input
                        type="text"
                        id="UyeAdi"
                        name="UyeAdi"
                        value={yeniUye.UyeAdi}
                        onChange={handleInputChange}
                        required
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="UyeSoyadi">Soyadı:</label>
                    <input
                        type="text"
                        id="UyeSoyadi"
                        name="UyeSoyadi"
                        value={yeniUye.UyeSoyadi}
                        onChange={handleInputChange}
                        required
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="Telefon">Telefon:</label>
                    <input
                        type="tel"
                        id="Telefon"
                        name="Telefon"
                        value={yeniUye.Telefon}
                        onChange={handleInputChange}
                        placeholder="05XX XXX XX XX"
                        required
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="Email">E-posta:</label>
                    <input
                        type="email"
                        id="Email"
                        name="Email"
                        value={yeniUye.Email}
                        onChange={handleInputChange}
                        placeholder="ornek@email.com"
                        required
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="UyelikDurumu">Üyelik Durumu:</label>
                    <select
                        id="UyelikDurumu"
                        name="UyelikDurumu"
                        value={yeniUye.UyelikDurumu}
                        onChange={handleInputChange}
                        required
                    >
                        <option value="Aktif">Aktif</option>
                        <option value="Pasif">Pasif</option>
                        <option value="Askıda">Askıda</option>
                    </select>
                </div>

                <button 
                    type="submit" 
                    className="submit-button" 
                    disabled={loading}
                >
                    {loading ? 'Ekleniyor...' : 'Üye Ekle'}
                </button>
            </form>
        </div>
    );
};

export default UyeEkle; 