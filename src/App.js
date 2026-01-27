import React, { useState, useEffect, useMemo, useRef } from "react";
import { BrowserRouter as Router, Routes, Route, Link, useNavigate, useLocation } from "react-router-dom";
import { Navbar, Container, Nav, Row, Col, Card, Button, Badge, Form, InputGroup, Carousel } from "react-bootstrap";
import { FaSearch, FaFan, FaChevronLeft, FaChevronRight, FaWind, FaWhatsapp, FaPhoneAlt, FaArrowUp, FaTruck, FaShieldAlt, FaHeadset, FaTools, FaMapMarkerAlt, FaEnvelope, FaClock, FaIndustry, FaUtensils, FaBuilding, FaStore } from "react-icons/fa";
import Papa from "papaparse";
import "bootstrap/dist/css/bootstrap.min.css";

// --- SEO---
const SEO = ({ title, description, keywords, schema }) => {
  useEffect(() => {
    document.title = title;
    // Meta Description
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) metaDesc.setAttribute("content", description);

    // Meta Keywords
    if (keywords) {
      let metaKey = document.querySelector('meta[name="keywords"]');
      if (metaKey) metaKey.setAttribute("content", keywords);
    }

    // JSON-LD Schema
    const existingScript = document.getElementById('jsonLdSchema');
    if (existingScript) existingScript.remove();

    if (schema) {
      const script = document.createElement('script');
      script.id = 'jsonLdSchema';
      script.type = 'application/ld+json';
      script.innerHTML = JSON.stringify(schema);
      document.head.appendChild(script);
    }
  }, [title, description, keywords, schema]);
  return null;
};

const formatPrice = (val) => {
  if (val === undefined || val === null || val === "" || val === 0 || val === "0") {
    return "Fiyat Sorunuz";
  }

  let stringVal = val.toString().replace(",", ".");
  let cleanVal = stringVal.replace(/[^0-9.]/g, "");
  let num = parseFloat(cleanVal);

  if (isNaN(num) || num === 0) return "Fiyat Sorunuz";

  return new Intl.NumberFormat("tr-TR", {
    maximumFractionDigits: num % 1 !== 0 ? 2 : 0
  }).format(num) + " ₺";
};

const CategoryBar = ({ categories }) => {
  const navigate = useNavigate();
  return (
    <nav className="category-scroll-wrapper py-3 border-bottom bg-white" aria-label="Kategori Gezintisi">
      <Container>
        <div className="d-flex overflow-auto no-scrollbar gap-2 py-1 align-items-center">
          <Button variant="primary" size="sm" className="rounded-pill text-nowrap px-4 fw-bold" onClick={() => navigate('/urunler', { state: { category: 'Hepsi' } })}>Tüm Ürünler</Button>
          {categories.map((cat, i) => (
            <Button key={i} variant="white" size="sm" className="rounded-pill text-nowrap px-3 border border-light-subtle fw-semibold bg-white" onClick={() => navigate('/urunler', { state: { category: cat } })}>{cat}</Button>
          ))}
        </div>
      </Container>
    </nav>
  );
};

const ProductCard = ({ product }) => {
  const rawImage = product.IMAGE?.startsWith('http') ? product.IMAGE : `/image/${product.IMAGE}`;
  const imageSrc = rawImage.includes("cloudinary.com") 
    ? rawImage.replace("/upload/", "/upload/f_auto,q_auto,w_500/") 
    : rawImage;
  const displayM3H = (product.M3H && product.M3H !== "0" && product.M3H !== 0) ? `${product.M3H} m³/h` : "-";
  const displayStrength = (product.STRENGTH && product.STRENGTH !== "0" && product.STRENGTH !== 0) ? `${product.STRENGTH} Kw` : "-";

  const productSchema = {
    "@context": "https://schema.org/",
    "@type": "Product",
    "name": product.PRODUCT_NAME,
    "image": product.IMAGE?.startsWith('http') ? product.IMAGE : `https://seninsiten.com/image/${product.IMAGE}`,
    "description": `${product.PRODUCT_NAME} - ${product.CATEGORY} havalandırma çözümü.`,
    "brand": { "@type": "Brand", "name": "Duru Fanmarket" },
    "offers": {
      "@type": "Offer",
      "priceCurrency": "TRY",
      "price": product.PRICE?.toString().replace(",", "."),
      "availability": "https://schema.org/InStock"
    }
  };

  return (
    <article className="h-100" aria-labelledby={`product-title-${product.PRODUCT_NAME.replace(/\s+/g, '-').toLowerCase()}`}>
      <Card className="h-100 border rounded-4 overflow-hidden product-card shadow-sm">
        <div className="bg-white p-4 d-flex align-items-center justify-content-center position-relative" style={{ height: "200px" }}>
          {product.IMAGE ? (
            <img src={imageSrc} alt={`${product.PRODUCT_NAME} Havalandırma Fanı`} loading="lazy" style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain" }}
              onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'block'; }} />
          ) : null}
          <FaFan size={60} className="text-light" style={{ display: product.IMAGE ? 'none' : 'block' }} />
          <Badge bg="white" text="dark" className="position-absolute bottom-0 start-0 m-3 border fw-bold">{displayM3H}</Badge>
        </div>
        <Card.Body className="p-3 d-flex flex-column">
          <header>
            <div className="text-uppercase fw-bold text-primary mb-1" style={{ fontSize: "0.65rem" }}>{product.CATEGORY}</div>
            <Card.Title id={`product-title-${product.PRODUCT_NAME.replace(/\s+/g, '-').toLowerCase()}`} className="fw-bold fs-6 text-dark mb-1" style={{ minHeight: "45px" }}>
              {product.PRODUCT_NAME}
            </Card.Title>
          </header>

          <div className="product-specs d-flex justify-content-between x-small text-muted mb-3 pb-2 border-bottom" style={{ fontSize: "0.75rem" }}>
            <span>Güç:</span><span className="fw-bold text-dark">{displayStrength}</span>
          </div>
          <footer className="mt-auto">
            <div className="text-primary text-nowrap d-flex align-items-center" style={{ minHeight: "35px" }}>
              {formatPrice(product.PRICE) === "Fiyat Sorunuz" ? (
                <span style={{ fontSize: "0.85rem", fontWeight: "600", color: "#6c757d" }}>
                  Fiyat Sorunuz
                </span>
              ) : (
                <div className="fs-5 fw-bold">
                  {formatPrice(product.PRICE)}
                  {product.PRICE && product.PRICE !== "0" && (
                    <small className="text-muted ms-1" style={{ fontSize: "0.7rem", fontWeight: "normal" }}>
                      +KDV
                    </small>
                  )}
                </div>
              )}
            </div>

            <Button
              variant="outline-primary"
              className="w-100 mt-2 py-2 fw-bold rounded-3"
              href={`https://wa.me/905541591203?text=${encodeURIComponent(`Merhaba, ${product.PRODUCT_NAME}, ürünü hakkında bilgi alabilir miyim?`)}`}
              target="_blank"
              aria-label={`${product.PRODUCT_NAME} için WhatsApp'tan bilgi alın`}
            >
              BİLGİ AL
            </Button>
          </footer>


        </Card.Body>
      </Card>
    </article>
  );
};

const useProducts = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const cached = localStorage.getItem("fan_market_data");
    if (cached) {
      setData(JSON.parse(cached));
      setLoading(false);
    }

    const sheetUrl = process.env.REACT_APP_SHEET_URL;
    
    if (sheetUrl) {
      Papa.parse(sheetUrl, {
        download: true,
        header: true,
        complete: (results) => {
          const cleanData = results.data.filter((item) => item.PRODUCT_NAME);
          if (cleanData.length > 0) {
            localStorage.setItem("fan_market_data", JSON.stringify(cleanData));
            setData(cleanData);
          }
          setLoading(false);
        },
        error: (err) => {
          console.error("Veri çekme hatası:", err);
          setLoading(false);
        }
      });
    } else {
      setLoading(false);
    }
    const timeout = setTimeout(() => {
      setLoading(false);
    }, 10000); 

    return () => clearTimeout(timeout);
  }, []);

  return { data, loading };
};

const HomePage = ({ data, loading }) => {
  <SEO title="Duru Fanmarket | Endüstriyel Havalandırma" description="Sanayi tipi fanlar ve havalandırma sistemlerinde en uygun fiyatlar." />
  const categories = useMemo(() => [...new Set(data.map(i => i.CATEGORY))], [data]);
  const featured = useMemo(() => [...data].sort(() => 0.5 - Math.random()).slice(0, 12), [data]);
  const recentlyAdded = useMemo(() => [...data].reverse().slice(0, 12), [data]);

  const [itemsPerSlide, setItemsPerSlide] = useState(window.innerWidth < 768 ? 1 : 4);
  const carouselRef = useRef(null);
  const newItemsRef = useRef(null);

  useEffect(() => {
    document.title = "Duru Fanmarket | Endüstriyel Havalandırma Sistemleri";
    const handleResize = () => setItemsPerSlide(window.innerWidth < 768 ? 1 : 4);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const bannerSlides = [
    { id: 1, topTitle: "ENDÜSTRİYEL ÇÖZÜMLER", title: "DURUFANMARKET", subtitle: "Havanız Değişsin, Performansla Güçlensin.", buttonText: "Ürünleri Keşfet", bgColor: "linear-gradient(135deg, #020a1a 0%, #0d2142 100%)" },
    { id: 2, topTitle: "GÜVENİLİR VE DAYANIKLI", title: "FANMARKET DÜNYASI", subtitle: "Sessiz, Güçlü ve Uzun Ömürlü Havalandırma Sistemleri.", buttonText: "Kataloğu İncele", bgColor: "linear-gradient(135deg, #0d2142 0%, #051937 100%)" }
  ];

  const features = [
    { icon: <FaTruck size={30} />, title: "Hızlı Teslimat", text: "Stoktan hemen teslimat avantajı." },
    { icon: <FaShieldAlt size={30} />, title: "Dayanıklı Ürünler", text: "Endüstriyel standartlarda kalite." },
    { icon: <FaHeadset size={30} />, title: "Teknik Destek", text: "Uzman kadromuzla yanınızdayız." },
    { icon: <FaTools size={30} />, title: "Geniş Yelpaze", text: "Her ihtiyaca uygun fan çözümleri." }
  ];

  const sectors = [
    { icon: <FaIndustry />, name: "Sanayi Tesisleri" },
    { icon: <FaUtensils />, name: "Restoran & Kafe" },
    { icon: <FaBuilding />, name: "Otopark & Plaza" },
    { icon: <FaStore />, name: "Depo & Mağaza" }
  ];

  return (
    <>
      <CategoryBar categories={categories} />

      <section aria-label="Ana Tanıtım Alanı">
        <Carousel fade controls={false} indicators={true} interval={5000} className="main-banner-carousel">
          {bannerSlides.map((slide) => (
            <Carousel.Item key={slide.id}>
              <div className="banner-slide" style={{ background: slide.bgColor }}>
                <div className="animated-bg-overlay"></div>
                <Container className="position-relative text-white z-2">
                  <Row className="align-items-center">
                    <Col lg={7} className="text-center text-lg-start">
                      <div className="top-badge mb-3"><FaWind className="me-2" /> {slide.topTitle}</div>
                      <h1 className="display-4 fw-black mb-3 slide-up-text">{slide.title}</h1>
                      <p className="lead mb-4 opacity-75">{slide.subtitle}</p>
                      <Button as={Link} to="/urunler" size="sm" className="fw-bold px-4 py-3 rounded-pill border-0 btn-hero">
                        {slide.buttonText}
                      </Button>
                    </Col>
                    <Col lg={5} className="d-none d-lg-flex justify-content-center position-relative p-5">
                      <FaFan size={320} className="text-white opacity-20 rotate-fast-alt main-fan-icon" aria-hidden="true" />
                    </Col>
                  </Row>
                </Container>
              </div>
            </Carousel.Item>
          ))}
        </Carousel>
      </section>

      <section className="my-5 px-3" aria-labelledby="featured-heading">
        <Container>
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h2 id="featured-heading" className="fw-bold border-start border-4 border-primary ps-3 mb-0 fs-3">Öne Çıkan Ürünler</h2>
            <div className="d-flex gap-2 carousel-nav-btns">
              <Button variant="white" className="rounded-circle border" onClick={() => carouselRef.current.prev()} aria-label="Önceki Ürünler"><FaChevronLeft size={16} /></Button>
              <Button variant="white" className="rounded-circle border" onClick={() => carouselRef.current.next()} aria-label="Sonraki Ürünler"><FaChevronRight size={16} /></Button>
            </div>
          </div>
          <Carousel ref={carouselRef} indicators={false} controls={false} interval={4000} className="featured-carousel pb-3">
            {Array.from({ length: Math.ceil(featured.length / itemsPerSlide) }).map((_, slideIndex) => (
              <Carousel.Item key={slideIndex}>
                <Row className="gx-3 gy-3 justify-content-center">
                  {featured.slice(slideIndex * itemsPerSlide, slideIndex * itemsPerSlide + itemsPerSlide).map((p, i) => (
                    <Col xs={12} md={6} lg={3} key={i}><ProductCard product={p} /></Col>
                  ))}
                </Row>
              </Carousel.Item>
            ))}
          </Carousel>
        </Container>
      </section>

      <section className="my-5 px-3" aria-labelledby="new-items-heading">
        <Container>
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h2 id="new-items-heading" className="fw-bold border-start border-4 border-primary ps-3 mb-0 fs-3">Yeni Ürünler</h2>
            <div className="d-flex gap-2 carousel-nav-btns">
              <Button variant="white" className="rounded-circle border" onClick={() => newItemsRef.current.prev()} aria-label="Önceki Yeni Ürünler"><FaChevronLeft size={16} /></Button>
              <Button variant="white" className="rounded-circle border" onClick={() => newItemsRef.current.next()} aria-label="Sonraki Yeni Ürünler"><FaChevronRight size={16} /></Button>
            </div>
          </div>
          <Carousel ref={newItemsRef} indicators={false} controls={false} interval={4500} className="featured-carousel pb-3">
            {Array.from({ length: Math.ceil(recentlyAdded.length / itemsPerSlide) }).map((_, slideIndex) => (
              <Carousel.Item key={slideIndex}>
                <Row className="gx-3 gy-3 justify-content-center">
                  {recentlyAdded.slice(slideIndex * itemsPerSlide, slideIndex * itemsPerSlide + itemsPerSlide).map((p, i) => (
                    <Col xs={12} md={6} lg={3} key={i}><ProductCard product={p} /></Col>
                  ))}
                </Row>
              </Carousel.Item>
            ))}
          </Carousel>
        </Container>
      </section>

      <section className="py-5 border-top bg-white" aria-labelledby="why-us-heading">
        <Container>
          <div className="text-center mb-5">
            <h2 id="why-us-heading" className="fw-bold mb-2 fs-3">Neden <span className="text-primary">DURU</span>FANMARKET?</h2>
            <p className="text-muted mx-auto" style={{ maxWidth: "600px" }}>Havalandırma teknolojilerinde yılların verdiği tecrübe ve güvenle yanınızdayız.</p>
          </div>
          <Row className="g-4 mb-5">
            {features.map((f, i) => (
              <Col md={6} lg={3} key={i}>
                <div className="text-center p-4 border rounded-4 h-100 bg-white shadow-sm feature-box">
                  <div className="text-primary mb-3" aria-hidden="true">{f.icon}</div>
                  <h3 className="fw-bold fs-6">{f.title}</h3>
                  <p className="small text-muted mb-0">{f.text}</p>
                </div>
              </Col>
            ))}
          </Row>

          <div className="sectors-bar p-4 rounded-4 border bg-light">
            <Row className="align-items-center justify-content-center gy-3 text-center">
              <Col lg={3} className="border-end-lg border-secondary border-opacity-25">
                <h4 className="mb-0 fw-bold text-dark fs-5">Uygulama Alanlarımız</h4>
              </Col>
              {sectors.map((s, i) => (
                <Col xs={6} md={3} lg={2} key={i} className="d-flex align-items-center justify-content-center gap-2">
                  <span className="fs-5 text-primary" aria-hidden="true">{s.icon}</span>
                  <span className="small fw-bold text-secondary">{s.name}</span>
                </Col>
              ))}
            </Row>
          </div>
        </Container>
      </section>
    </>
  );
};

const ProductsPage = ({ data, loading }) => {
  const location = useLocation();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(location.state?.category || "Hepsi");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 16;
  <SEO
    title={`${selectedCategory === "Hepsi" ? "Tüm Ürünler" : selectedCategory} Modelleri | Duru Fanmarket`}
    description={`${selectedCategory} kategorisindeki en uygun fiyatlı endüstriyel fan çözümlerini Duru Fanmarket'te inceleyin.`}
    keywords={`${selectedCategory}, sanayi tipi fan, havalandırma sistemleri, fan fiyatları`}
  />
  useEffect(() => {
    const displayCat = selectedCategory === "Hepsi" ? "ÜRÜN LİSTESİ" : selectedCategory;
    document.title = `${displayCat} MODELLERİ | Duru Fanmarket`;

    if (location.state?.category) {
      setSelectedCategory(location.state.category);
    }

    setCurrentPage(1);
    window.scrollTo({ top: 0, behavior: "smooth" });

  }, [location.state, selectedCategory]);

  const filtered = useMemo(() => {
    return data.filter((p) => {
      const mSearch = p.PRODUCT_NAME?.toLowerCase().includes(searchTerm.toLowerCase());
      const mCat = selectedCategory === "Hepsi" || p.CATEGORY === selectedCategory;
      return mSearch && mCat;
    });
  }, [data, searchTerm, selectedCategory]);

  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const currentItems = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <Container className="py-4">
      <header className="bg-white p-3 rounded-4 mb-2 border">
        <Row className="align-items-center g-3 text-center text-md-start">
          <Col md={4}><h1 className="fw-bold mb-0 ps-2 border-start border-4 border-primary fs-4">Ürünlerimiz</h1></Col>
          <Col md={4}>
            <InputGroup className="bg-light rounded-pill px-2 border">
              <InputGroup.Text className="bg-transparent border-0 text-muted"><FaSearch aria-hidden="true" /></InputGroup.Text>
              <Form.Control className="bg-transparent border-0 shadow-none" placeholder="Arama yapın..." aria-label="Ürün arama kutusu" onChange={(e) => setSearchTerm(e.target.value)} />
            </InputGroup>
          </Col>
          <Col md={4}>
            <Form.Select className="rounded-pill shadow-none border" aria-label="Kategori seçin" value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)}>
              {["Hepsi", ...new Set(data.map(i => i.CATEGORY))].map(cat => <option key={cat} value={cat}>{cat}</option>)}
            </Form.Select>
          </Col>
        </Row>
      </header>

      <div className="mb-3 ps-2">
        <span className="text-muted">Toplam <span className="text-primary fw-bold">{filtered.length}</span> ürün listeleniyor</span>
      </div>

      <section aria-label="Ürün Listesi">
        <Row className="gy-4">
          {currentItems.map((p, i) => (<Col xs={12} md={6} lg={4} xl={3} key={i}><ProductCard product={p} /></Col>))}
        </Row>
      </section>

      {!loading && totalPages > 1 && (
        <nav className="pagination-wrapper mt-5 mb-5" aria-label="Sayfalama">
          <div className="pagi-content d-flex align-items-center gap-3">
            <button className="pagi-nav-btn" onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1} aria-label="Önceki Sayfa"><FaChevronLeft size={12} /></button>
            <div className="pagi-numbers d-flex gap-2">
              {[...Array(totalPages)].map((_, i) => (i + 1 === 1 || i + 1 === totalPages || (i + 1 >= currentPage - 1 && i + 1 <= currentPage + 1)) ?
                <button key={i} className={`pagi-num-btn ${currentPage === i + 1 ? 'active' : ''}`} onClick={() => handlePageChange(i + 1)} aria-current={currentPage === i + 1 ? 'page' : undefined}>{i + 1}</button> : null)}
            </div>
            <button className="pagi-nav-btn" onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages} aria-label="Sonraki Sayfa"><FaChevronRight size={12} /></button>
          </div>
        </nav>
      )}
    </Container>
  );
};

function App() {
  const { data, loading } = useProducts();
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [navExpanded, setNavExpanded] = useState(false);

  useEffect(() => {
    const handleScroll = () => setShowBackToTop(window.scrollY > 400);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  if (loading) {
    return (
      <div style={{ 
        height: '100vh', display: 'flex', flexDirection: 'column', 
        alignItems: 'center', justifyContent: 'center', background: '#fff' 
      }}>
        <FaFan size={80} className="text-primary rotate-fast-alt mb-3" />
        <h2 className="fw-bold"><span className="text-primary">DURU</span>FANMARKET</h2>
        <div className="spinner-border text-primary mt-2" role="status"></div>
        <p className="text-muted mt-3 fw-semibold">Ürünler Hazırlanıyor...</p>
      </div>
    );
  }

  return (
    <Router>
      <div style={{ backgroundColor: "#f8f9fa", minHeight: "100vh" }} className="d-flex flex-column">
        <header className="sticky-top">
          <Navbar bg="white" expand="lg" expanded={navExpanded} onToggle={(expanded) => setNavExpanded(expanded)} className="main-navbar py-3 border-bottom shadow-sm">
            <Container>
              <Navbar.Brand as={Link} to="/" className="fw-bold fs-3" onClick={() => setNavExpanded(false)}>
                <span style={{ color: "#0d6efd" }}>DURU</span><span style={{ color: "#000" }}>FANMARKET</span>
              </Navbar.Brand>
              <Navbar.Toggle className="border-0 shadow-none p-0 custom-toggler" aria-controls="main-navigation">
                <div className={`hamburger-icon ${navExpanded ? 'open' : ''}`}><span></span><span></span><span></span></div>
              </Navbar.Toggle>
              <Navbar.Collapse id="main-navigation" className="justify-content-end">
                <Nav as="nav" className="text-center mt-3 mt-lg-0">
                  <Nav.Link as={Link} to="/" className="nav-custom-link" onClick={() => setNavExpanded(false)}>Anasayfa</Nav.Link>
                  <Nav.Link as={Link} to="/urunler" className="nav-custom-link" onClick={() => setNavExpanded(false)}>Ürünler</Nav.Link>
                </Nav>
              </Navbar.Collapse>
            </Container>
          </Navbar>
        </header>

        <main className="flex-grow-1">
          <Routes>
            <Route path="/" element={<HomePage data={data} loading={loading} />} />
            <Route path="/urunler" element={<ProductsPage data={data} loading={loading} />} />
          </Routes>
        </main>

        <footer className="bg-white border-top pt-5 pb-3">
          <Container>
            <Row className="gy-4 justify-content-lg-between text-center text-md-start">
              <Col lg={3}>
                <section>
                  <h4 className="fw-bold mb-3"><span className="text-primary">DURU</span>FANMARKET</h4>
                  <p className="text-muted small">Endüstriyel havalandırma çözümlerinde güvenilir ortağınız. En kaliteli fan sistemlerini en uygun fiyatlarla sunuyoruz.</p>
                </section>
              </Col>

              <Col lg={4} className="px-lg-5">
                <section className="d-flex flex-column align-items-center align-items-md-start">
                  <h2 className="fw-bold mb-3 text-uppercase border-bottom border-primary border-2 pb-1 d-inline-block w-auto fs-6">Çalışma Saatleri</h2>
                  <div className="small text-muted mt-2 w-100">
                    <div className="d-flex justify-content-center justify-content-md-start gap-3 mb-2 border-bottom pb-1">
                      <span className="text-nowrap">Pzt - Cmt:</span>
                      <strong className="text-dark">09:00 - 19:00</strong>
                    </div>
                    <div className="d-flex justify-content-center justify-content-md-start gap-3">
                      <span className="text-nowrap">Pazar:</span>
                      <strong className="text-danger">KAPALI</strong>
                    </div>
                    <p className="mt-3 x-small italic text-muted text-center text-md-start">
                      <FaClock className="me-1 text-primary" aria-hidden="true" /> Mesai saatleri dışındaki talepleriniz için WhatsApp üzerinden mesaj bırakabilirsiniz.
                    </p>
                  </div>
                </section>
              </Col>

              <Col lg={3}>
                <section className="d-flex flex-column align-items-center align-items-md-start">
                  <h2 className="fw-bold mb-3 text-uppercase border-bottom border-primary border-2 pb-1 d-inline-block w-auto fs-6">İletişim</h2>
                  <address className="small text-muted mt-2 font-normal">
                    <p className="mb-2 text-nowrap"><FaMapMarkerAlt className="text-primary me-2" aria-hidden="true" /> İstanbul, Türkiye</p>
                    <p className="mb-2 text-nowrap"><FaPhoneAlt className="text-primary me-2" aria-hidden="true" /> +90 5XX XXX XX XX</p>
                    <p className="mb-2 text-nowrap"><FaEnvelope className="text-primary me-2" aria-hidden="true" /> info@durufanmarket.com</p>
                  </address>
                </section>
              </Col>
            </Row>
            <hr className="my-4 opacity-50" />
            <div className="text-center small text-muted">
              © {new Date().getFullYear()} Duru Fanmarket. Tüm hakları saklıdır.
            </div>
          </Container>
        </footer>

        <aside className="fixed-contact-buttons">
          <a href="tel:+905XXXXXXXXX" className="contact-btn phone" aria-label="Telefonla Arayın"><FaPhoneAlt size={16} /></a>
          <a href="https://wa.me/905XXXXXXXXX" target="_blank" rel="noopener noreferrer" className="contact-btn whatsapp" aria-label="WhatsApp Destek Hattı"><FaWhatsapp size={20} /></a>
        </aside>
        <button className={`back-to-top-btn ${showBackToTop ? 'show' : ''}`} onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })} aria-label="Yukarı Çık"><FaArrowUp size={14} /></button>

        <style>{`
          .no-scrollbar::-webkit-scrollbar { display: none; }
          .nav-custom-link { font-weight: 700; color: #333 !important; padding: 8px 20px !important; position: relative; }
          @media (min-width: 992px) { .nav-custom-link::after { content: ''; position: absolute; width: 0; height: 3px; bottom: 0; left: 50%; background-color: #0d6efd; transition: 0.3s; transform: translateX(-50%); } .nav-custom-link:hover::after { width: 60%; } }
          .hamburger-icon { width: 30px; height: 20px; position: relative; display: flex; flex-direction: column; justify-content: space-between; }
          .hamburger-icon span { display: block; height: 3px; width: 100%; background: #0d6efd; border-radius: 9px; transition: 0.3s; }
          .hamburger-icon.open span:nth-child(1) { transform: translateY(8.5px) rotate(45deg); }
          .hamburger-icon.open span:nth-child(2) { opacity: 0; }
          .hamburger-icon.open span:nth-child(3) { transform: translateY(-8.5px) rotate(-45deg); }
          .carousel-nav-btns .btn-white:hover { background-color: #0d6efd !important; color: white !important; border-color: #0d6efd !important; transition: 0.3s; }
          .pagi-num-btn { border: none; background: transparent; font-weight: 700; color: #555; padding: 5px 12px; transition: 0.2s; }
          .pagi-num-btn.active { color: #0d6efd; border-bottom: 2px solid #0d6efd; }
          .pagi-nav-btn { border: none; background: transparent; color: #0d6efd; }
          .fixed-contact-buttons { position: fixed; left: 20px; bottom: 20px; display: flex; flex-direction: column; gap: 10px; z-index: 1000; }
          .contact-btn { width: 45px; height: 45px; border-radius: 50%; display: flex; align-items: center; justify-content: center; background: white; border: 1px solid #eee; text-decoration: none; color: #0d6efd; box-shadow: 0 4px 10px rgba(0,0,0,0.1); }
          .contact-btn:hover { background: #0d6efd; color: white; transform: translateY(-3px); transition: 0.3s; }
          .back-to-top-btn { position: fixed; right: 20px; bottom: 20px; width: 40px; height: 40px; border-radius: 8px; background: white; color: #0d6efd; border: 1px solid #eee; display: flex; align-items: center; justify-content: center; z-index: 1000; opacity: 0; visibility: hidden; transition: 0.3s; box-shadow: 0 4px 10px rgba(0,0,0,0.1); }
          .back-to-top-btn.show { opacity: 1; visibility: visible; }
          .product-card { transition: 0.3s; border: 1px solid #eee !important; }
          .product-card:hover { transform: translateY(-8px);  box-shadow: 0 10px 20px rgba(0,0,0,0.05) !important; }
          .feature-box { transition: 0.3s; }
          .feature-box:hover { transform: translateY(-5px); border-color: #0d6efd !important; }
          @media (min-width: 992px) { .border-end-lg { border-right: 1px solid #dee2e6 !important; } }
          .banner-slide { height: 600px; display: flex; align-items: center; overflow: hidden; }
          @media (max-width: 991px) { .banner-slide { height: 400px; } }
          .rotate-fast-alt { animation: rotation 15s infinite linear; }
          @keyframes rotation { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        `}</style>
      </div>
    </Router>
  );
}

export default App;