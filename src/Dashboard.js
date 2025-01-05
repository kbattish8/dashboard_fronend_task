import React, { useEffect, useState, useRef } from "react";
import { initializeChart, destroyChart } from "./utility/Chart";
import "bootstrap/dist/css/bootstrap.min.css";
import jsPDF from "jspdf";
import { saveAs } from "file-saver";
import * as XLSX from "xlsx";

const Dashboard = ({ setIsLoggedIn }) => {
  const [articles, setArticles] = useState([]);
  const [filteredArticles, setFilteredArticles] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({
    author: "",
    type: "",
    startDate: "",
    endDate: "",
  });
  const chartRef = useRef(null);
  const [showExportModal, setShowExportModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const articlesPerPage = 6;

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const response = await fetch(
          "https://newsapi.org/v2/top-headlines?country=us&apiKey=2fae7b7ed8754447806e50d46738e4d1"
        );
        const data = await response.json();
        const limitedArticles = (data.articles || []).slice(0, 20);
        setArticles(limitedArticles);
        setFilteredArticles(limitedArticles);
      } catch (error) {
        console.error("Error fetching news:", error);
        alert("Failed to fetch news articles. Please try again later.");
      }
    };
    fetchNews();
  }, []);

  const handleFilters = () => {
    let updatedArticles = articles;

    if (filters.author) {
      updatedArticles = updatedArticles.filter((article) =>
        article.author?.toLowerCase().includes(filters.author.toLowerCase())
      );
    }
    if (filters.type) {
      updatedArticles = updatedArticles.filter((article) =>
        article.type?.toLowerCase().includes(filters.type.toLowerCase())
      );
    }
    if (filters.startDate && filters.endDate) {
      updatedArticles = updatedArticles.filter((article) => {
        const publishedDate = new Date(article.publishedAt);
        return (
          publishedDate >= new Date(filters.startDate) &&
          publishedDate <= new Date(filters.endDate)
        );
      });
    }

    setFilteredArticles(
      updatedArticles.filter((article) =>
        article.title?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    handleFilters();
  };

  const handleLogout = () => {
    localStorage.setItem("loggedIn", "false");
    setIsLoggedIn(false);
    alert("You have been logged out.");
  };

  useEffect(() => {
    const canvas = chartRef.current;

    const authorCounts = filteredArticles.reduce((acc, article) => {
      const author = article.author || "Unknown";
      acc[author] = (acc[author] || 0) + 1;
      return acc;
    }, {});

    const labels = Object.keys(authorCounts);
    const dataValues = Object.values(authorCounts);

    if (canvas) {
      initializeChart(
        canvas,
        "line",
        {
          labels,
          datasets: [
            {
              label: "Articles by Author",
              data: dataValues,
              borderColor: "#36A2EB",
              backgroundColor: "rgba(54, 162, 235, 0.2)",
              tension: 0.4,
            },
          ],
        },
        {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: "top",
            },
          },
          scales: {
            y: {
              beginAtZero: true,
            },
          },
        }
      );
    }

    return () => {
      destroyChart();
    };
  }, [filteredArticles]);

  const exportAsPDF = () => {
    const doc = new jsPDF();
    let y = 10;

    filteredArticles.forEach((article, index) => {
      doc.text(`Title: ${article.title || "N/A"}`, 10, y);
      doc.text(`Author: ${article.author || "Unknown"}`, 10, y + 10);
      doc.text(`Published: ${new Date(article.publishedAt).toLocaleDateString()}`, 10, y + 20);
      doc.addPage();
      y = 10;
    });

    doc.save("articles.pdf");
  };

  const exportAsCSV = () => {
    const csvContent = [
      ["Title", "Author", "Published"],
      ...filteredArticles.map((article) => [
        article.title || "N/A",
        article.author || "Unknown",
        new Date(article.publishedAt).toLocaleDateString(),
      ]),
    ];

    const csvBlob = new Blob([csvContent.map((row) => row.join(",")).join("\n")], {
      type: "text/csv;charset=utf-8;",
    });

    saveAs(csvBlob, "articles.csv");
  };

  const exportAsSheet = () => {
    const worksheet = XLSX.utils.json_to_sheet(
      filteredArticles.map((article) => ({
        Title: article.title || "N/A",
        Author: article.author || "Unknown",
        Published: new Date(article.publishedAt).toLocaleDateString(),
      }))
    );

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Articles");
    XLSX.writeFile(workbook, "articles.xlsx");
  };

  const totalPages = Math.ceil(filteredArticles.length / articlesPerPage);
  const startIndex = (currentPage - 1) * articlesPerPage;
  const paginatedArticles = filteredArticles.slice(
    startIndex,
    startIndex + articlesPerPage
  );

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  return (
    <div className="container my-4">
      <header className="d-flex justify-content-between align-items-center bg-primary text-white p-1 rounded">
        <h1 className="h5">Dashboard</h1>
        <button className="btn btn-danger" onClick={handleLogout}>
          Logout
        </button>
      </header>

      <div className="filters bg-light p-1 mt-1 rounded shadow-sm">
        <div className="row g-2">
          <div className="col-sm">
            <input
              type="text"
              className="form-control"
              placeholder="Search articles..."
              value={searchTerm}
              onChange={handleSearch}
            />
          </div>
          <div className="col-sm">
            <input
              type="text"
              className="form-control"
              placeholder="Filter by Author"
              value={filters.author}
              onChange={(e) =>
                setFilters({ ...filters, author: e.target.value })
              }
            />
          </div>
          <div className="col-sm">
            <select
              className="form-select"
              onChange={(e) =>
                setFilters({ ...filters, type: e.target.value })
              }
              value={filters.type}
            >
              <option value="">All Types</option>
              <option value="news">News</option>
              <option value="blogs">Blogs</option>
            </select>
          </div>
          <div className="col-sm">
            <input
              type="date"
              className="form-control"
              onChange={(e) =>
                setFilters({ ...filters, startDate: e.target.value })
              }
            />
          </div>
          <div className="col-sm">
            <input
              type="date"
              className="form-control"
              onChange={(e) =>
                setFilters({ ...filters, endDate: e.target.value })
              }
            />
          </div>
          <div className="col-sm">
            <button className="btn btn-warning w-100 text-white" onClick={handleFilters}>
              Apply Filters
            </button>
          </div>
          <div className="col-sm">
            <button
              className="btn btn-success w-100"
              onClick={() => setShowExportModal(true)}
            >
              Export
            </button>
          </div>
        </div>
      </div>

      {showExportModal && (
        <div
          className="modal show d-block"
          tabIndex="-1"
          style={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }}
        >
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Export Options</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowExportModal(false)}
                ></button>
              </div>
              <div className="modal-body">
                <button className="btn btn-primary w-100 mb-2" onClick={exportAsPDF}>
                  Export as PDF
                </button>
                <button className="btn btn-primary w-100 mb-2" onClick={exportAsCSV}>
                  Export as CSV
                </button>
                <button className="btn btn-primary w-100" onClick={exportAsSheet}>
                  Export as Google Sheet (Excel)
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="articles row row-cols-1 row-cols-md-2 row-cols-lg-3 g-1 mt-1">
        {paginatedArticles.map((article, index) => (
          <div className="col" key={index}>
            <div className="card h-100 shadow-sm" style={{ height: "150px" }}>
              <div className="card-body" style={{ height: "190px", padding: "1px" }}>
                <h5 className="card-title">{article.title}</h5>
                <p className="card-text">
                  <strong>Author:</strong> {article.author || "Unknown"}
                </p>
                <p className="card-text">
                  <strong>Published:</strong>{" "}
                  {new Date(article.publishedAt).toLocaleDateString()}
                </p>
                <p className="card-text">
                  <strong>Type:</strong> {article.type || "News"}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="d-flex justify-content-between mt-2">
        <button
          className="btn btn-warning"
          onClick={handlePrevPage}
          disabled={currentPage === 1}
        >
          Previous
        </button>
        <button
          className="btn btn-warning"
          onClick={handleNextPage}
          disabled={currentPage === totalPages}
        >
          Next
        </button>
      </div>

      <div className="charts bg-light p-1 mt-1 rounded shadow-sm">
        <h2 className="h6 text-center">Article Trends by Author</h2>
        <div style={{ height: "100px" }}>
          <canvas ref={chartRef}></canvas>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
