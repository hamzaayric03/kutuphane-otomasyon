import React, { useState, useEffect } from 'react';
import './Books.css';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { 
  FaSearch, FaSpinner, FaSort, FaSortUp, FaSortDown, 
  FaFilter, FaBook, FaBookOpen, FaList, FaThLarge,
  FaChevronLeft, FaChevronRight, FaDownload, FaPrint,
  FaHeart, FaShare, FaBookmark, FaStar
} from 'react-icons/fa';
import { useTheme } from '../context/ThemeContext';

function Books() {
  const [books, setBooks] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [booksPerPage, setBooksPerPage] = useState(12);
  const [sortConfig, setSortConfig] = useState({ key: 'KitapAdi', direction: 'asc' });
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [categories, setCategories] = useState([]);
  const [viewMode, setViewMode] = useState('grid');
  const [selectedBooks, setSelectedBooks] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const { isDarkTheme } = useTheme();

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        setLoading(true);
        const response = await axios.get('http://localhost:3001/api/kitaplar');
        setBooks(response.data);
        
        const uniqueCategories = [...new Set(response.data.map(book => book.KategoriAdi))].filter(Boolean);
        setCategories(uniqueCategories);
        
        // Favorileri local storage'dan yükle
        const savedFavorites = localStorage.getItem('bookFavorites');
        if (savedFavorites) {
          setFavorites(JSON.parse(savedFavorites));
        }
        
        setError('');
      } catch (err) {
        setError('Kitaplar yüklenirken bir hata oluştu. Lütfen sayfayı yenileyin.');
        console.error('Kitaplar alınamadı:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchBooks();
  }, []);

  const toggleFavorite = (bookId) => {
    setFavorites(prev => {
      const newFavorites = prev.includes(bookId)
        ? prev.filter(id => id !== bookId)
        : [...prev, bookId];
      
      localStorage.setItem('bookFavorites', JSON.stringify(newFavorites));
      return newFavorites;
    });
  };

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const getSortIcon = (key) => {
    if (sortConfig.key !== key) return <FaSort />;
    return sortConfig.direction === 'asc' ? <FaSortUp /> : <FaSortDown />;
  };

  const handleBookSelection = (bookId) => {
    setSelectedBooks(prev => {
      if (prev.includes(bookId)) {
        return prev.filter(id => id !== bookId);
      } else {
        return [...prev, bookId];
      }
    });
  };

  const handleSelectAll = () => {
    if (selectedBooks.length === filteredAndSortedBooks.length) {
      setSelectedBooks([]);
    } else {
      setSelectedBooks(filteredAndSortedBooks.map(book => book.KitapID));
    }
  };

  const filteredAndSortedBooks = books
    .filter(book => {
      const matchesSearch = (
        (book.KitapAdi && book.KitapAdi.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (book.YazarAdi && book.YazarAdi.toLowerCase().includes(searchTerm.toLowerCase()))
      );
      const matchesCategory = selectedCategory === 'all' || book.KategoriAdi === selectedCategory;
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      if (!sortConfig.key) return 0;
      
      const aValue = a[sortConfig.key] || '';
      const bValue = b[sortConfig.key] || '';
      
      return sortConfig.direction === 'asc' 
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue);
    });

  const indexOfLastBook = currentPage * booksPerPage;
  const indexOfFirstBook = indexOfLastBook - booksPerPage;
  const currentBooks = filteredAndSortedBooks.slice(indexOfFirstBook, indexOfLastBook);
  const totalPages = Math.ceil(filteredAndSortedBooks.length / booksPerPage);

  if (loading) {
    return (
      <div className="books-loading">
        <FaSpinner className="spinner" />
        <p>Kitaplar yükleniyor...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="books-error">
        <div className="error-message">
          <p>{error}</p>
          <button onClick={() => window.location.reload()}>Yeniden Dene</button>
        </div>
      </div>
    );
  }

  return (
    <div className={`books-page ${isDarkTheme ? 'dark' : 'light'}`}>
      <div className="books-header">
        <div className="header-content">
          <h1><FaBookOpen /> Kütüphane Kataloğu</h1>
          <p>Toplam {filteredAndSortedBooks.length} kitap bulundu</p>
        </div>
      </div>

      <div className="search-section">
        <div className="search-box">
          <FaSearch className="search-icon" />
          <input
            type="text"
            placeholder="Kitap adı veya yazar adı ile arama yapın..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="filter-section">
          <div className="filter-box">
            <FaFilter className="filter-icon" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              <option value="all">Tüm Kategoriler</option>
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>

          <div className="view-controls">
            <button 
              className={`view-mode-btn ${viewMode === 'grid' ? 'active' : ''}`}
              onClick={() => setViewMode('grid')}
            >
              <FaThLarge /> Grid
            </button>
            <button 
              className={`view-mode-btn ${viewMode === 'list' ? 'active' : ''}`}
              onClick={() => setViewMode('list')}
            >
              <FaList /> Liste
            </button>
          </div>

          <select
            className="per-page-select"
            value={booksPerPage}
            onChange={(e) => {
              setBooksPerPage(Number(e.target.value));
              setCurrentPage(1);
            }}
          >
            <option value={12}>12 Kitap</option>
            <option value={24}>24 Kitap</option>
            <option value={48}>48 Kitap</option>
          </select>
        </div>
      </div>

      {viewMode === 'grid' ? (
        <div className="books-grid">
          {currentBooks.map(book => (
            <div 
              className={`book-card ${selectedBooks.includes(book.KitapID) ? 'selected' : ''}`} 
              key={book.KitapID}
            >
              <div className={`book-cover ${book.KitapMevcutDurumu === 1 ? 'available' : 'borrowed'}`}>
                <FaBook className="book-icon" />
                <span className="availability-badge">
                  {book.KitapMevcutDurumu === 1 ? 'MEVCUT' : 'ÖDÜNÇ'}
                </span>
                <div className="book-actions">
                  <button 
                    className={`action-btn favorite ${favorites.includes(book.KitapID) ? 'active' : ''}`}
                    onClick={() => toggleFavorite(book.KitapID)}
                  >
                    <FaHeart />
                  </button>
                  <button className="action-btn">
                    <FaShare />
                  </button>
                  <button className="action-btn">
                    <FaBookmark />
                  </button>
                </div>
              </div>
              <div className="book-info">
                <div className="book-rating">
                  <FaStar className="star-icon" />
                  <span>4.5</span>
                </div>
                <h3 className="book-title">{book.KitapAdi}</h3>
                <p className="book-author">{book.YazarAdi}</p>
                {book.KategoriAdi && (
                  <span className="book-category">{book.KategoriAdi}</span>
                )}
                <div className="book-status">
                  {book.KitapMevcutDurumu === 1 ? (
                    <span className="status-badge available">KÜTÜPHANEDE MEVCUT</span>
                  ) : (
                    <span className="status-badge borrowed">ÖDÜNÇ VERİLDİ</span>
                  )}
                </div>
                <Link to={`/books/${book.KitapID}`} className="details-button">
                  Detayları Görüntüle
                </Link>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="books-table">
          <table>
            <thead>
              <tr>
                <th>
                  <input
                    type="checkbox"
                    checked={selectedBooks.length === filteredAndSortedBooks.length}
                    onChange={handleSelectAll}
                  />
                </th>
                <th onClick={() => handleSort('KitapID')}>
                  ID {getSortIcon('KitapID')}
                </th>
                <th onClick={() => handleSort('KitapAdi')}>
                  Kitap Adı {getSortIcon('KitapAdi')}
                </th>
                <th onClick={() => handleSort('YazarAdi')}>
                  Yazar {getSortIcon('YazarAdi')}
                </th>
                <th onClick={() => handleSort('KategoriAdi')}>
                  Kategori {getSortIcon('KategoriAdi')}
                </th>
                <th>Durum</th>
                <th>İşlemler</th>
              </tr>
            </thead>
            <tbody>
              {currentBooks.map(book => (
                <tr 
                  key={book.KitapID}
                  className={selectedBooks.includes(book.KitapID) ? 'selected' : ''}
                >
                  <td>
                    <input
                      type="checkbox"
                      checked={selectedBooks.includes(book.KitapID)}
                      onChange={() => handleBookSelection(book.KitapID)}
                    />
                  </td>
                  <td>{book.KitapID}</td>
                  <td>{book.KitapAdi}</td>
                  <td>{book.YazarAdi}</td>
                  <td>{book.KategoriAdi || '-'}</td>
                  <td>
                    {book.KitapMevcutDurumu === 1 ? (
                      <span className="status-badge available">KÜTÜPHANEDE MEVCUT</span>
                    ) : (
                      <span className="status-badge borrowed">ÖDÜNÇ VERİLDİ</span>
                    )}
                  </td>
                  <td className="action-buttons">
                    <button 
                      className={`action-btn favorite ${favorites.includes(book.KitapID) ? 'active' : ''}`}
                      onClick={() => toggleFavorite(book.KitapID)}
                    >
                      <FaHeart />
                    </button>
                    <Link to={`/books/${book.KitapID}`} className="table-action-btn">
                      Detaylar
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {filteredAndSortedBooks.length === 0 && (
        <div className="no-results">
          <FaBook className="no-results-icon" />
          <p>
            {searchTerm
              ? 'Aramanıza uygun kitap bulunamadı.'
              : 'Henüz kitap bulunmuyor.'}
          </p>
        </div>
      )}

      {filteredAndSortedBooks.length > 0 && (
        <div className="pagination">
          <button
            onClick={() => setCurrentPage(1)}
            disabled={currentPage === 1}
            className="pagination-button"
          >
            ««
          </button>
          <button
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
            className="pagination-button"
          >
            <FaChevronLeft /> Önceki
          </button>
          
          <div className="page-numbers">
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let pageNum;
              if (totalPages <= 5) {
                pageNum = i + 1;
              } else if (currentPage <= 3) {
                pageNum = i + 1;
              } else if (currentPage >= totalPages - 2) {
                pageNum = totalPages - 4 + i;
              } else {
                pageNum = currentPage - 2 + i;
              }
              
              return (
                <button
                  key={pageNum}
                  onClick={() => setCurrentPage(pageNum)}
                  className={`pagination-button ${currentPage === pageNum ? 'active' : ''}`}
                >
                  {pageNum}
                </button>
              );
            })}
          </div>
          
          <button
            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
            disabled={currentPage === totalPages}
            className="pagination-button"
          >
            Sonraki <FaChevronRight />
          </button>
          <button
            onClick={() => setCurrentPage(totalPages)}
            disabled={currentPage === totalPages}
            className="pagination-button"
          >
            »»
          </button>
        </div>
      )}
    </div>
  );
}

export default Books;