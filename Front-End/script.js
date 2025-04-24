document.addEventListener('DOMContentLoaded', function() {
  // Get all necessary elements
  const mainInfoSection = document.getElementById('mainInfoSection');
  const aboutSection = document.getElementById('aboutSection');
  const servicesSection = document.getElementById('servicesSection');
  const contactSection = document.getElementById('contactSection');
  const adminSection = document.getElementById('adminSection');
  const registrationSection = document.getElementById('registrationSection');
  const searchSection = document.getElementById('searchSection');
  
  // Navigation buttons
  const aboutBtn = document.getElementById('aboutBtn');
  const servicesBtn = document.getElementById('servicesBtn');
  const contactBtn = document.getElementById('contactBtn');
  const adminBtn = document.getElementById('adminBtn');
  const showRegisterBtn = document.getElementById('showRegisterBtn');
  const showSearchBtn = document.getElementById('showSearchBtn');
  
  // Close buttons
  const closeRegisterBtn = document.getElementById('closeRegisterBtn');
  const closeSearchBtn = document.getElementById('closeSearchBtn');
  
  // Mobile menu elements
  const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
  const mobileMenu = document.querySelector('.mobile-menu');
  const mobileAboutBtn = document.getElementById('mobileAboutBtn');
  const mobileServicesBtn = document.getElementById('mobileServicesBtn');
  const mobileContactBtn = document.getElementById('mobileContactBtn');
  const mobileAdminBtn = document.getElementById('mobileAdminBtn');
  const mobileRegisterBtn = document.getElementById('mobileRegisterBtn');
  const mobileSearchBtn = document.getElementById('mobileSearchBtn');
  
  // Form elements
  const donorForm = document.getElementById('donorForm');
  const searchButton = document.getElementById('searchButton');
  
  // Admin elements
  const adminLoginBtn = document.getElementById('adminLoginBtn');
  const adminMessage = document.getElementById('adminMessage');
  
  // Admin credentials (for demo purposes)
  const ADMIN_CREDENTIALS = {
      username: "",
      password: ""
  };
  
  // Pagination variables
  let currentPage = 1;
  const donorsPerPage = 5;

  // ======================
  // SECTION VISIBILITY FUNCTIONS
  // ======================
  
  function hideAllSections() {
      // Hide all sections
      document.querySelectorAll('.info-section, .action-section').forEach(section => {
          section.classList.add('hidden');
      });
  }
  
  function showMainContent() {
      hideAllSections();
      mainInfoSection.classList.remove('hidden');
  }
  
  function showSection(section) {
      hideAllSections();
      section.classList.remove('hidden');
  }
  
  // Expose to global scope for HTML buttons
  window.hideSection = function(sectionId) {
      document.getElementById(sectionId).classList.add('hidden');
      showMainContent();
  };
  
  // ======================
  // EVENT LISTENERS
  // ======================
  
  // Desktop navigation
  aboutBtn.addEventListener('click', () => showSection(aboutSection));
  servicesBtn.addEventListener('click', () => showSection(servicesSection));
  contactBtn.addEventListener('click', () => showSection(contactSection));
  adminBtn.addEventListener('click', () => showSection(adminSection));
  showRegisterBtn.addEventListener('click', () => showSection(registrationSection));
  showSearchBtn.addEventListener('click', () => showSection(searchSection));
  
  // Mobile navigation
  mobileAboutBtn.addEventListener('click', () => {
      showSection(aboutSection);
      closeMobileMenu();
  });
  mobileServicesBtn.addEventListener('click', () => {
      showSection(servicesSection);
      closeMobileMenu();
  });
  mobileContactBtn.addEventListener('click', () => {
      showSection(contactSection);
      closeMobileMenu();
  });
  mobileAdminBtn.addEventListener('click', () => {
      showSection(adminSection);
      closeMobileMenu();
  });
  mobileRegisterBtn.addEventListener('click', () => {
      showSection(registrationSection);
      closeMobileMenu();
  });
  mobileSearchBtn.addEventListener('click', () => {
      showSection(searchSection);
      closeMobileMenu();
  });
  
  // Close buttons
  closeRegisterBtn.addEventListener('click', showMainContent);
  closeSearchBtn.addEventListener('click', showMainContent);
  
  // Mobile menu toggle
  mobileMenuBtn.addEventListener('click', toggleMobileMenu);
  
  // Admin login
  adminLoginBtn.addEventListener('click', handleAdminLogin);
  
  // Form submissions
  if (donorForm) {
      donorForm.addEventListener('submit', handleDonorRegistration);
  }
  if (searchButton) {
      searchButton.addEventListener('click', handleDonorSearch);
  }
  
  // ======================
  // HELPER FUNCTIONS
  // ======================
  
  function toggleMobileMenu() {
      mobileMenu.classList.toggle('hidden');
      const icon = mobileMenuBtn.querySelector('i');
      icon.classList.toggle('fa-bars');
      icon.classList.toggle('fa-times');
  }
  
  function closeMobileMenu() {
      mobileMenu.classList.add('hidden');
      const icon = mobileMenuBtn.querySelector('i');
      icon.classList.remove('fa-times');
      icon.classList.add('fa-bars');
  }
  
  function handleAdminLogin() {
      const username = document.getElementById('adminUsername').value;
      const password = document.getElementById('adminPassword').value;
      
      if (username === ADMIN_CREDENTIALS.username && password === ADMIN_CREDENTIALS.password) {
          adminMessage.textContent = "Login successful! Redirecting to admin panel...";
          adminMessage.className = "message success";
          setTimeout(() => {
              alert("Admin panel would open here. In a complete application, this would show donor management features.");
              adminSection.classList.add('hidden');
              showMainContent();
          }, 1500);
      } else {
          adminMessage.textContent = "Invalid username or password";
          adminMessage.className = "message error";
      }
  }
  
  async function handleDonorRegistration(e) {
      e.preventDefault();
      
      const donorData = {
          name: document.getElementById('name').value,
          bloodGroup: document.getElementById('bloodGroup').value,
          phone: document.getElementById('phone').value,
          province: document.getElementById('province').value,
          city: document.getElementById('city').value
      };

      try {
          const response = await fetch('http://localhost:5000/register-donor', {
              method: 'POST',
              headers: {
                  'Content-Type': 'application/json'
              },
              body: JSON.stringify(donorData)
          });

          const result = await response.json();
          
          if (response.ok) {
              alert(`Thank you, ${donorData.name}! You are now registered as a blood donor.`);
              donorForm.reset();
              registrationSection.classList.add('hidden');
              showMainContent();
          } else {
              alert(result.message || 'You are already registered as a donor!');
          }
      } catch (error) {
          console.error('Registration Error:', error);
          alert('Failed to register donor. Please try again.');
      }
  }
  
  async function handleDonorSearch() {
      const searchCriteria = {
          bloodGroup: document.getElementById('searchBloodGroup').value,
          province: document.getElementById('searchProvince').value,
          city: document.getElementById('searchCity').value
      };

      if (!searchCriteria.bloodGroup) {
          alert('Please select a blood group to search');
          return;
      }

      try {
          const response = await fetch('http://localhost:5000/search-donors', {
              method: 'POST',
              headers: {
                  'Content-Type': 'application/json'
              },
              body: JSON.stringify(searchCriteria)
          });

          const donors = await response.json();
          displaySearchResults(donors);
      } catch (error) {
          console.error('Search Error:', error);
          alert('Failed to search donors. Please try again.');
      }
  }
  
  function displaySearchResults(donors) {
      const resultsDiv = document.getElementById('searchResults');
      resultsDiv.innerHTML = '';

      if (donors.length === 0) {
          resultsDiv.innerHTML = '<div class="no-results">No donors found matching your criteria.</div>';
          return;
      }

      // Calculate pagination
      const totalPages = Math.ceil(donors.length / donorsPerPage);
      const startIndex = (currentPage - 1) * donorsPerPage;
      const endIndex = startIndex + donorsPerPage;
      const paginatedDonors = donors.slice(startIndex, endIndex);

      // Display donor count
      const countHeader = document.createElement('div');
      countHeader.className = 'results-header';
      countHeader.innerHTML = `
          <h3><i class="fas fa-users"></i> Found ${donors.length} Donor(s)</h3>
          <span>Showing ${startIndex + 1}-${Math.min(endIndex, donors.length)} of ${donors.length}</span>
      `;
      resultsDiv.appendChild(countHeader);

      // Display donors
      paginatedDonors.forEach((donor, index) => {
          const card = document.createElement('div');
          card.className = 'donor-card';
          card.innerHTML = `
              <div class="donor-number">${startIndex + index + 1}</div>
              <h3>${donor.Name}</h3>
              <p><i class="fas fa-tint"></i> <strong>Blood Group:</strong> ${donor.BloodGroup}</p>
              <p><i class="fas fa-map-marker-alt"></i> <strong>Location:</strong> ${donor.City}, ${donor.Province}</p>
              <div class="contact">
                  <p><i class="fas fa-phone"></i> <strong>Phone:</strong> <a href="tel:${donor.Phone}">${donor.Phone}</a></p>
              </div>
              <div class="actions">
                  <button class="contact-btn" onclick="window.open('tel:${donor.Phone}')">
                      <i class="fas fa-phone"></i> Call Now
                  </button>
                  <button class="whatsapp-btn" onclick="window.open('https://wa.me/${donor.Phone.replace(/^0/, '92')}?text=Hello%20${donor.Name.split(' ')[0]}%2C%20I%20need%20blood%20donation%20help')">
                      <i class="fab fa-whatsapp"></i> WhatsApp
                  </button>
              </div>
          `;
          resultsDiv.appendChild(card);
      });

      // Add pagination if needed
      if (donors.length > donorsPerPage) {
          const paginationDiv = document.createElement('div');
          paginationDiv.className = 'pagination';
          
          // Previous button
          if (currentPage > 1) {
              const prevBtn = document.createElement('button');
              prevBtn.className = 'page-btn';
              prevBtn.innerHTML = '<i class="fas fa-chevron-left"></i> Previous';
              prevBtn.addEventListener('click', () => {
                  currentPage--;
                  displaySearchResults(donors);
              });
              paginationDiv.appendChild(prevBtn);
          }

          // Page numbers
          for (let i = 1; i <= totalPages; i++) {
              const pageBtn = document.createElement('button');
              pageBtn.className = `page-btn ${i === currentPage ? 'active' : ''}`;
              pageBtn.textContent = i;
              pageBtn.addEventListener('click', () => {
                  currentPage = i;
                  displaySearchResults(donors);
              });
              paginationDiv.appendChild(pageBtn);
          }

          // Next button
          if (currentPage < totalPages) {
              const nextBtn = document.createElement('button');
              nextBtn.className = 'page-btn';
              nextBtn.innerHTML = 'Next <i class="fas fa-chevron-right"></i>';
              nextBtn.addEventListener('click', () => {
                  currentPage++;
                  displaySearchResults(donors);
              });
              paginationDiv.appendChild(nextBtn);
          }

          resultsDiv.appendChild(paginationDiv);
      }
  }

  // Initialize by showing main content
  showMainContent();
});
