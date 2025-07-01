import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Home.css';
import { FaSort, FaSortUp, FaSortDown, FaSpinner, FaSearch, FaBook, FaUsers, FaUserCheck, FaEdit, FaCheck, FaTimes, FaBookOpen, FaCalendarAlt, FaPlus, FaArrowRight } from 'react-icons/fa';
import { useTheme } from '../context/ThemeContext';

// Axios instance oluştur
const api = axios.create({
    baseURL: 'http://localhost:3001',
    timeout: 5000,
    headers: {
        'Content-Type': 'application/json'
    }
});

function Home() {
    const [books, setBooks] = useState([]);
    const [members, setMembers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
    const [pageSize, setPageSize] = useState(10);
    const [currentPage, setCurrentPage] = useState(1);
    const [bookPageSize, setBookPageSize] = useState(10);
    const [bookCurrentPage, setBookCurrentPage] = useState(1);
    const [bookSearchTerm, setBookSearchTerm] = useState('');
    const [bookSortConfig, setBookSortConfig] = useState({ key: null, direction: 'asc' });
    const [editingMember, setEditingMember] = useState(null);
    const [editForm, setEditForm] = useState({
        UyeAdi: '',
        UyeSoyadi: '',
        TCKimlik: '',
        Telefon: '',
        Email: '',
        UyelikDurumu: ''
    });
    const [updateStatus, setUpdateStatus] = useState({ show: false, message: '', type: '' });
    const { isDarkTheme, toggleTheme } = useTheme();

    // Sıralama fonksiyonu
    const sortData = (data, key, direction) => {
        return [...data].sort((a, b) => {
            if (a[key] < b[key]) return direction === 'asc' ? -1 : 1;
            if (a[key] > b[key]) return direction === 'asc' ? 1 : -1;
            return 0;
        });
    };

    // Sıralama işleyicisi
    const handleSort = (key) => {
        let direction = 'asc';
        if (sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    // Sıralama ikonu
    const getSortIcon = (key) => {
        if (sortConfig.key !== key) return <FaSort />;
        return sortConfig.direction === 'asc' ? <FaSortUp /> : <FaSortDown />;
    };

    // Kitap filtreleme ve sıralama
    const filteredBooks = books
        .filter(book =>
            book.KitapAdi.toLowerCase().includes(bookSearchTerm.toLowerCase()) ||
            book.YazarAdi.toLowerCase().includes(bookSearchTerm.toLowerCase()) ||
            (book.KategoriAdi && book.KategoriAdi.toLowerCase().includes(bookSearchTerm.toLowerCase()))
        );

    const sortedBooks = bookSortConfig.key
        ? sortData(filteredBooks, bookSortConfig.key, bookSortConfig.direction)
        : filteredBooks;

    const paginatedBooks = sortedBooks.slice(
        (bookCurrentPage - 1) * bookPageSize,
        bookCurrentPage * bookPageSize
    );

    // Kitap sıralama işleyicisi
    const handleBookSort = (key) => {
        let direction = 'asc';
        if (bookSortConfig.key === key && bookSortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setBookSortConfig({ key, direction });
    };

    // Kitap sıralama ikonu
    const getBookSortIcon = (key) => {
        if (bookSortConfig.key !== key) return <FaSort />;
        return bookSortConfig.direction === 'asc' ? <FaSortUp /> : <FaSortDown />;
    };

    // Verileri yükle
    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                setError(null);
                const [booksResponse, membersResponse] = await Promise.all([
                    api.get('/api/kitaplar'),
                    api.get('/api/uyeler')
                ]);
                setBooks(booksResponse.data);
                setMembers(membersResponse.data);
            } catch (error) {
                console.error('Veri yükleme hatası:', error);
                setError('Veri yükleme hatası: ' + (error.response?.data?.message || error.message));
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    useEffect(() => {
        document.documentElement.setAttribute('data-theme', isDarkTheme ? 'dark' : 'light');
    }, [isDarkTheme]);

    // Üye filtreleme ve sıralama
    const filteredMembers = members
        .filter(member =>
            member.UyeAdi.toLowerCase().includes(searchTerm.toLowerCase()) ||
            member.UyeSoyadi.toLowerCase().includes(searchTerm.toLowerCase()) ||
            member.TCKimlik.includes(searchTerm) ||
            member.Email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            member.Telefon.includes(searchTerm)
        );

    const sortedMembers = sortConfig.key
        ? sortData(filteredMembers, sortConfig.key, sortConfig.direction)
        : filteredMembers;

    const paginatedMembers = sortedMembers.slice(
        (currentPage - 1) * pageSize,
        currentPage * pageSize
    );

    // Düzenleme modunu başlat
    const handleEditClick = (member) => {
        setEditingMember(member.UyeID);
        setEditForm({
            UyeAdi: member.UyeAdi,
            UyeSoyadi: member.UyeSoyadi,
            TCKimlik: member.TCKimlik,
            Telefon: member.Telefon,
            Email: member.Email,
            UyelikDurumu: member.UyelikDurumu
        });
    };

    // Düzenlemeyi kaydet
    const handleSaveEdit = async (UyeID) => {
        try {
            setLoading(true);
            
            // Form verilerini kontrol et
            if (!editForm.UyeAdi || !editForm.UyeSoyadi || !editForm.TCKimlik) {
                throw new Error('Ad, Soyad ve TC Kimlik alanları zorunludur.');
            }

            // TC Kimlik kontrolü
            if (editForm.TCKimlik.length !== 11 || !/^\d+$/.test(editForm.TCKimlik)) {
                throw new Error('TC Kimlik numarası 11 haneli ve sadece rakamlardan oluşmalıdır.');
            }

            // Telefon format kontrolü
            if (editForm.Telefon && !/^\d{10,11}$/.test(editForm.Telefon.replace(/\D/g, ''))) {
                throw new Error('Geçerli bir telefon numarası giriniz.');
            }

            // Email format kontrolü
            if (editForm.Email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(editForm.Email)) {
                throw new Error('Geçerli bir email adresi giriniz.');
            }

            // API isteği öncesi log
            console.log('API İsteği yapılıyor:', {
                endpoint: `/api/uye/guncelle/${UyeID}`,
                data: editForm
            });

            // API çağrısını güncelle
            const response = await api.put(`/api/uye/guncelle/${UyeID}`, {
                ...editForm,
                UyeID
            });

            console.log('API Yanıtı:', response);

            if (response.data) {
                // Üye listesini güncelle
                const updatedMembers = members.map(member => 
                    member.UyeID === UyeID ? { ...member, ...editForm } : member
                );
                setMembers(updatedMembers);
                setEditingMember(null);
                setUpdateStatus({
                    show: true,
                    message: 'Üye bilgileri başarıyla güncellendi',
                    type: 'success'
                });
            }
        } catch (error) {
            console.error('Üye güncelleme hatası detayları:', {
                message: error.message,
                status: error.response?.status,
                statusText: error.response?.statusText,
                data: error.response?.data,
                config: error.config,
                endpoint: error.config?.url
            });

            let errorMessage = 'Üye güncellenirken bir hata oluştu: ';
            
            if (error.response) {
                if (error.response.status === 404) {
                    errorMessage = 'Güncelleme yapılacak üye bulunamadı veya API endpoint\'i hatalı.';
                } else {
                    errorMessage += error.response.data?.message || error.response.statusText;
                }
            } else if (error.request) {
                errorMessage = 'Sunucuya bağlanılamadı. Lütfen internet bağlantınızı ve sunucunun çalıştığını kontrol edin.';
            } else {
                errorMessage += error.message;
            }

            setUpdateStatus({
                show: true,
                message: errorMessage,
                type: 'error'
            });
        } finally {
            setLoading(false);
            setTimeout(() => {
                setUpdateStatus({ show: false, message: '', type: '' });
            }, 3000);
        }
    };

    // Düzenlemeyi iptal et
    const handleCancelEdit = () => {
        setEditingMember(null);
        setEditForm({
            UyeAdi: '',
            UyeSoyadi: '',
            TCKimlik: '',
            Telefon: '',
            Email: '',
            UyelikDurumu: ''
        });
    };

    // Form değişikliklerini takip et
    const handleFormChange = (e) => {
        const { name, value } = e.target;
        setEditForm(prev => ({
            ...prev,
            [name]: value
        }));
    };

    if (loading) {
        return (
            <div className="loading-container">
                <FaSpinner className="spinner" />
                <p>Veriler yükleniyor...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="error-container">
                <p>{error}</p>
                <button onClick={() => window.location.reload()}>Yeniden Dene</button>
            </div>
        );
    }

    return (
        <div className="home">
            <div className="home-header">
                <div className="header-content">
                    <h1>Kütüphane Yönetim Sistemi</h1>
                    <p className="subtitle">Kitapları ve üyeleri kolayca yönetin</p>
                </div>
                <button 
                    className="theme-toggle"
                    onClick={toggleTheme}
                    title={isDarkTheme ? "Açık Temaya Geç" : "Koyu Temaya Geç"}
                >
                    {isDarkTheme ? "🌞" : "🌙"}
                </button>
            </div>

            <div className="statistics-container">
                <div className="stat-card">
                    <div className="stat-icon">
                        <FaBookOpen />
                    </div>
                    <div className="stat-content">
                        <h3>Toplam Kitap</h3>
                        <p className="stat-number">{books.length}</p>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon">
                        <FaUsers />
                    </div>
                    <div className="stat-content">
                        <h3>Toplam Üye</h3>
                        <p className="stat-number">{members.length}</p>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon">
                        <FaUserCheck />
                    </div>
                    <div className="stat-content">
                        <h3>Aktif Üyeler</h3>
                        <p className="stat-number">
                            {members.filter(m => m.UyelikDurumu === 'Aktif').length}
                        </p>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon">
                        <FaCalendarAlt />
                    </div>
                    <div className="stat-content">
                        <h3>Bu Ay Yeni Üyeler</h3>
                        <p className="stat-number">
                            {members.filter(m => {
                                const joinDate = new Date(m.UyelikTarihi);
                                const now = new Date();
                                return joinDate.getMonth() === now.getMonth() && 
                                       joinDate.getFullYear() === now.getFullYear();
                            }).length}
                        </p>
                    </div>
                </div>
            </div>

            <div className="tables-container">
                <div className="table-section">
                    <div className="section-header">
                        <h2>Kitap Listesi</h2>
                    </div>
                    <div className="search-box">
                        <FaSearch className="search-icon" />
                        <input
                            type="text"
                            placeholder="Kitap Ara (Kitap Adı, Yazar veya Kategori)"
                            value={bookSearchTerm}
                            onChange={(e) => setBookSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="table-wrapper">
                        <table>
                            <thead>
                                <tr>
                                    <th onClick={() => handleBookSort('KitapID')}>
                                        ID {getBookSortIcon('KitapID')}
                                    </th>
                                    <th onClick={() => handleBookSort('KitapAdi')}>
                                        Kitap Adı {getBookSortIcon('KitapAdi')}
                                    </th>
                                    <th onClick={() => handleBookSort('YazarAdi')}>
                                        Yazar {getBookSortIcon('YazarAdi')}
                                    </th>
                                    <th onClick={() => handleBookSort('KategoriAdi')}>
                                        Kategori {getBookSortIcon('KategoriAdi')}
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {paginatedBooks.map((book) => (
                                    <tr key={book.KitapID}>
                                        <td>{book.KitapID}</td>
                                        <td>{book.KitapAdi}</td>
                                        <td>{book.YazarAdi}</td>
                                        <td>{book.KategoriAdi || '-'}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <div className="pagination">
                        <select
                            value={bookPageSize}
                            onChange={(e) => {
                                setBookPageSize(Number(e.target.value));
                                setBookCurrentPage(1);
                            }}
                            className="page-size-select"
                        >
                            <option value={10}>10 Kayıt</option>
                            <option value={20}>20 Kayıt</option>
                            <option value={50}>50 Kayıt</option>
                        </select>
                        <div className="pagination-buttons">
                            <button
                                onClick={() => setBookCurrentPage(p => Math.max(1, p - 1))}
                                disabled={bookCurrentPage === 1}
                                className="pagination-button"
                            >
                                Önceki
                            </button>
                            <span className="page-info">
                                Sayfa {bookCurrentPage} / {Math.ceil(sortedBooks.length / bookPageSize)}
                            </span>
                            <button
                                onClick={() => setBookCurrentPage(p => Math.min(Math.ceil(sortedBooks.length / bookPageSize), p + 1))}
                                disabled={bookCurrentPage === Math.ceil(sortedBooks.length / bookPageSize)}
                                className="pagination-button"
                            >
                                Sonraki
                            </button>
                        </div>
                    </div>
                </div>

                <div className="table-section members-table">
                    <div className="section-header">
                        <h2>Üye Listesi</h2>
                        <div className="table-info">
                            Toplam {sortedMembers.length} üyeden {(currentPage - 1) * pageSize + 1} - {Math.min(currentPage * pageSize, sortedMembers.length)} arası gösteriliyor
                        </div>
                    </div>
                    
                    {updateStatus.show && (
                        <div className={`update-status ${updateStatus.type}`}>
                            {updateStatus.message}
                        </div>
                    )}

                    <div className="search-box">
                        <FaSearch className="search-icon" />
                        <input
                            type="text"
                            placeholder="Üye Ara (Ad, Soyad, TC Kimlik, Email veya Telefon)"
                            value={searchTerm}
                            onChange={(e) => {
                                setSearchTerm(e.target.value);
                                setCurrentPage(1); // Arama yapıldığında ilk sayfaya dön
                            }}
                        />
                    </div>

                    <div className="table-wrapper">
                        <table>
                            <thead>
                                <tr>
                                    <th onClick={() => handleSort('UyeID')}>
                                        ID {getSortIcon('UyeID')}
                                    </th>
                                    <th onClick={() => handleSort('UyeAdi')}>
                                        Ad {getSortIcon('UyeAdi')}
                                    </th>
                                    <th onClick={() => handleSort('UyeSoyadi')}>
                                        Soyad {getSortIcon('UyeSoyadi')}
                                    </th>
                                    <th onClick={() => handleSort('TCKimlik')}>
                                        TC Kimlik {getSortIcon('TCKimlik')}
                                    </th>
                                    <th>İletişim</th>
                                    <th onClick={() => handleSort('UyelikTarihi')}>
                                        Üyelik {getSortIcon('UyelikTarihi')}
                                    </th>
                                    <th onClick={() => handleSort('UyelikDurumu')}>
                                        Durum {getSortIcon('UyelikDurumu')}
                                    </th>
                                    <th style={{ minWidth: '240px' }}>İşlem</th>
                                </tr>
                            </thead>
                            <tbody>
                                {paginatedMembers.map((member) => (
                                    <tr key={member.UyeID}>
                                        <td>{member.UyeID}</td>
                                        <td>
                                            {editingMember === member.UyeID ? (
                                                <input
                                                    type="text"
                                                    name="UyeAdi"
                                                    value={editForm.UyeAdi}
                                                    onChange={handleFormChange}
                                                    className="edit-input"
                                                />
                                            ) : (
                                                member.UyeAdi
                                            )}
                                        </td>
                                        <td>
                                            {editingMember === member.UyeID ? (
                                                <input
                                                    type="text"
                                                    name="UyeSoyadi"
                                                    value={editForm.UyeSoyadi}
                                                    onChange={handleFormChange}
                                                    className="edit-input"
                                                />
                                            ) : (
                                                member.UyeSoyadi
                                            )}
                                        </td>
                                        <td>
                                            {editingMember === member.UyeID ? (
                                                <input
                                                    type="text"
                                                    name="TCKimlik"
                                                    value={editForm.TCKimlik}
                                                    onChange={handleFormChange}
                                                    className="edit-input"
                                                />
                                            ) : (
                                                member.TCKimlik
                                            )}
                                        </td>
                                        <td>
                                            {editingMember === member.UyeID ? (
                                                <div className="contact-inputs">
                                                    <input
                                                        type="tel"
                                                        name="Telefon"
                                                        value={editForm.Telefon}
                                                        onChange={handleFormChange}
                                                        className="edit-input"
                                                        placeholder="Telefon"
                                                    />
                                                    <input
                                                        type="email"
                                                        name="Email"
                                                        value={editForm.Email}
                                                        onChange={handleFormChange}
                                                        className="edit-input"
                                                        placeholder="E-posta"
                                                    />
                                                </div>
                                            ) : (
                                                <div className="contact-info">
                                                    <div>{member.Telefon}</div>
                                                    <div>{member.Email}</div>
                                                </div>
                                            )}
                                        </td>
                                        <td>{new Date(member.UyelikTarihi).toLocaleDateString('tr-TR')}</td>
                                        <td>
                                            {editingMember === member.UyeID ? (
                                                <select
                                                    name="UyelikDurumu"
                                                    value={editForm.UyelikDurumu}
                                                    onChange={handleFormChange}
                                                    className="edit-input"
                                                >
                                                    <option value="Aktif">Aktif</option>
                                                    <option value="Pasif">Pasif</option>
                                                    <option value="Askida">Askıda</option>
                                                </select>
                                            ) : (
                                                <span className={`status-badge ${member.UyelikDurumu.toLowerCase()}`}>
                                                    {member.UyelikDurumu}
                                                </span>
                                            )}
                                        </td>
                                        <td>
                                            <div className="action-buttons">
                                                {editingMember === member.UyeID ? (
                                                    <>
                                                        <button
                                                            onClick={() => handleSaveEdit(member.UyeID)}
                                                            className="save-button save-button-with-text"
                                                            title="Değişiklikleri Kaydet"
                                                            disabled={loading}
                                                        >
                                                            {loading ? <FaSpinner className="spinner" /> : <><FaCheck /> <span>Kaydet</span></>}
                                                        </button>
                                                        <button
                                                            onClick={handleCancelEdit}
                                                            className="cancel-button cancel-button-with-text"
                                                            title="Düzenlemeyi İptal Et"
                                                            disabled={loading}
                                                        >
                                                            <FaTimes /> <span>İptal</span>
                                                        </button>
                                                    </>
                                                ) : (
                                                    <button
                                                        onClick={() => handleEditClick(member)}
                                                        className="edit-button edit-button-with-text"
                                                        title="Üye Bilgilerini Düzenle"
                                                    >
                                                        <FaEdit /> <span>Düzenle</span>
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <div className="pagination">
                        <div className="pagination-controls">
                            <select
                                value={pageSize}
                                onChange={(e) => {
                                    setPageSize(Number(e.target.value));
                                    setCurrentPage(1); // Sayfa boyutu değiştiğinde ilk sayfaya dön
                                }}
                                className="page-size-select"
                            >
                                <option value={10}>10 Kayıt</option>
                                <option value={20}>20 Kayıt</option>
                                <option value={50}>50 Kayıt</option>
                                <option value={100}>100 Kayıt</option>
                            </select>
                            <div className="pagination-buttons">
                                <button
                                    onClick={() => setCurrentPage(1)}
                                    disabled={currentPage === 1}
                                    className="pagination-button"
                                    title="İlk Sayfa"
                                >
                                    ««
                                </button>
                                <button
                                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                    disabled={currentPage === 1}
                                    className="pagination-button"
                                >
                                    Önceki
                                </button>
                                <span className="page-info">
                                    Sayfa {currentPage} / {Math.ceil(sortedMembers.length / pageSize)}
                                </span>
                                <button
                                    onClick={() => setCurrentPage(p => Math.min(Math.ceil(sortedMembers.length / pageSize), p + 1))}
                                    disabled={currentPage === Math.ceil(sortedMembers.length / pageSize)}
                                    className="pagination-button"
                                >
                                    Sonraki
                                </button>
                                <button
                                    onClick={() => setCurrentPage(Math.ceil(sortedMembers.length / pageSize))}
                                    disabled={currentPage === Math.ceil(sortedMembers.length / pageSize)}
                                    className="pagination-button"
                                    title="Son Sayfa"
                                >
                                    »»
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Home;