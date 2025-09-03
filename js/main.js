// Wait for the DOM to be fully loaded and then add a small delay to ensure all elements are rendered
document.addEventListener('DOMContentLoaded', function() {
    // Add a small delay to ensure all elements are fully rendered
    setTimeout(function() {
        initializeBookingFunctionality();
    }, 100);
});

// Pricing structure based on your requirements
const PRICING = {
    'home-cleaning': {
        furnished: {
            '1rk': 2000,
            '1bhk': 2500,
            '2bhk': 4500,
            '3bhk': 5500,
            '4bhk': 7000,
            '5bhk': 10000
        },
        'non-furnished': {
            '1rk': 1500,
            '1bhk': 2000,
            '2bhk': 4000,
            '3bhk': 5000,
            '4bhk': 6000,
            '5bhk': 8500
        }
    },
    'kitchen-cleaning': {
        '1bhk': 1500,
        '2bhk': 2000,
        '3bhk': 2500,
        '4bhk': 3000,
        '5bhk': 3500
    },
    'bathroom-cleaning': {
        perBathroom: 500,
        minimum: 1500
    }
};

function initializeBookingFunctionality() {
    console.log("Initializing booking functionality");
    
    // Mobile Navigation Toggle
    const mobileNavToggle = document.querySelector('.mobile-nav-toggle');
    const navMenu = document.querySelector('.nav-menu');
    
    if (mobileNavToggle) {
        mobileNavToggle.addEventListener('click', function() {
            navMenu.classList.toggle('active');
            const icon = mobileNavToggle.querySelector('i');
            if (icon.classList.contains('fa-bars')) {
                icon.classList.remove('fa-bars');
                icon.classList.add('fa-times');
            } else {
                icon.classList.remove('fa-times');
                icon.classList.add('fa-bars');
            }
        });
    }
    
    // Header scroll effect
    const header = document.querySelector('.header');
    if (header) {
        window.addEventListener('scroll', function() {
            if (window.scrollY > 50) {
                header.classList.add('scrolled');
            } else {
                header.classList.remove('scrolled');
            }
        });
    }
    
    // Service option selection in booking page
    const serviceOptions = document.querySelectorAll('.service-option');
    if (serviceOptions.length > 0) {
        serviceOptions.forEach(option => {
            option.addEventListener('click', function(event) {
                event.preventDefault();
                event.stopPropagation();
                
                serviceOptions.forEach(opt => opt.classList.remove('selected'));
                this.classList.add('selected');
                
                const serviceInput = document.querySelector('#selected-service');
                if (serviceInput) {
                    serviceInput.value = this.dataset.service;
                }
                
                // Update apartment size options based on selected service
                updateApartmentSizeOptions(this.dataset.service);
                
                storeStepData(0);
                updateBookingSummary();
            });
        });
    }
    
    // Function to update apartment size options based on service
    function updateApartmentSizeOptions(serviceType) {
        const apartmentSizes = document.querySelectorAll('.apartment-size');
        
        apartmentSizes.forEach(size => {
            const sizeKey = size.dataset.size;
            
            if (serviceType === 'kitchen-cleaning') {
                // Kitchen cleaning doesn't have 1RK option
                if (sizeKey === '1rk') {
                    size.style.display = 'none';
                } else {
                    size.style.display = 'block';
                    const price = PRICING['kitchen-cleaning'][sizeKey];
                    if (price) {
                        size.dataset.price = price;
                        size.innerHTML = size.innerHTML.split('<br>')[0] || sizeKey.toUpperCase();
                    }
                }
            } else if (serviceType === 'bathroom-cleaning') {
                // Bathroom cleaning uses different logic - hide apartment sizes, show bathroom count instead
                size.style.display = 'none';
            } else {
                // Full home cleaning - show all sizes
                size.style.display = 'block';
            }
        });
        
        // For bathroom cleaning, we need special handling
        if (serviceType === 'bathroom-cleaning') {
            createBathroomCountSelector();
        } else {
            removeBathroomCountSelector();
        }
    }
    
    function createBathroomCountSelector() {
        const apartmentSizesContainer = document.querySelector('.apartment-sizes');
        if (!apartmentSizesContainer) return;
        
        // Remove existing bathroom selector if it exists
        removeBathroomCountSelector();
        
        // Create bathroom count selector
        const bathroomSelector = document.createElement('div');
        bathroomSelector.className = 'bathroom-count-selector';
        bathroomSelector.innerHTML = `
            <label>Number of Bathrooms:</label>
            <div class="bathroom-counts">
                <div class="bathroom-count" data-count="3" data-price="1500">3 Bathrooms<br><small>₹1,500 (Minimum)</small></div>
                <div class="bathroom-count" data-count="4" data-price="2000">4 Bathrooms<br><small>₹2,000</small></div>
                <div class="bathroom-count" data-count="5" data-price="2500">5 Bathrooms<br><small>₹2,500</small></div>
                <div class="bathroom-count" data-count="6" data-price="3000">6 Bathrooms<br><small>₹3,000</small></div>
            </div>
        `;
        
        apartmentSizesContainer.parentNode.appendChild(bathroomSelector);
        
        // Add event listeners to bathroom counts
        const bathroomCounts = bathroomSelector.querySelectorAll('.bathroom-count');
        bathroomCounts.forEach(count => {
            count.style.cssText = `
                padding: 10px 20px;
                border: 1px solid #ddd;
                border-radius: 8px;
                cursor: pointer;
                transition: all 0.3s ease;
                text-align: center;
                margin: 5px;
            `;
            
            count.addEventListener('click', function() {
                bathroomCounts.forEach(c => {
                    c.classList.remove('active');
                    c.style.backgroundColor = '';
                    c.style.color = '';
                    c.style.borderColor = '#ddd';
                });
                
                this.classList.add('active');
                this.style.backgroundColor = '#0072bc';
                this.style.color = 'white';
                this.style.borderColor = '#0072bc';
                
                // Store bathroom count data
                sessionStorage.setItem('bathroomCount', this.dataset.count);
                sessionStorage.setItem('bathroomPrice', this.dataset.price);
                sessionStorage.setItem('apartmentSizeText', `${this.dataset.count} Bathrooms`);
                
                storeStepData(1);
                updateBookingSummary();
            });
        });
        
        // Style the container
        const bathroomCountsContainer = bathroomSelector.querySelector('.bathroom-counts');
        bathroomCountsContainer.style.cssText = `
            display: flex;
            flex-wrap: wrap;
            gap: 10px;
            margin-top: 10px;
        `;
    }
    
    function removeBathroomCountSelector() {
        const existingSelector = document.querySelector('.bathroom-count-selector');
        if (existingSelector) {
            existingSelector.remove();
        }
    }
    
    // Apartment size selection
    const apartmentSizes = document.querySelectorAll('.apartment-size');
    if (apartmentSizes.length > 0) {
        apartmentSizes.forEach(size => {
            size.addEventListener('click', function(event) {
                event.preventDefault();
                event.stopPropagation();
                
                apartmentSizes.forEach(s => s.classList.remove('active'));
                this.classList.add('active');
                
                storeStepData(1);
                updateBookingSummary();
            });
        });
    }
    
    // Add furnishing option event listeners
    const furnishingOptions = document.querySelectorAll('input[name="furnishing"]');
    if (furnishingOptions.length > 0) {
        furnishingOptions.forEach(option => {
            option.addEventListener('change', function() {
                storeStepData(1);
                updateBookingSummary();
            });
        });
    }
    
    // Add-on service selection
    const addOnServices = document.querySelectorAll('.add-on-service');
    if (addOnServices.length > 0) {
        addOnServices.forEach(service => {
            service.addEventListener('click', function(event) {
                event.preventDefault();
                event.stopPropagation();
                this.classList.toggle('selected');
                
                storeStepData(1);
                updateBookingSummary();
            });
        });
    }
    
    // Payment option selection
    const paymentOptions = document.querySelectorAll('.payment-option');
    if (paymentOptions.length > 0) {
        paymentOptions.forEach(option => {
            option.addEventListener('click', function(event) {
                event.preventDefault();
                event.stopPropagation();
                paymentOptions.forEach(o => o.classList.remove('selected'));
                this.classList.add('selected');
                
                storeStepData(1);
                updateBookingSummary();
            });
        });
    }
    
    // Add event listeners for date and time inputs
    const dateInput = document.querySelector('#service-date');
    const timeInput = document.querySelector('#service-time');
    
    if (dateInput) {
        dateInput.addEventListener('change', function() {
            storeStepData(2);
            updateBookingSummary();
        });
        // Set minimum date to today
        const today = new Date();
        dateInput.min = today.toISOString().split('T')[0];
    }
    
    if (timeInput) {
        timeInput.addEventListener('change', function() {
            storeStepData(2);
            updateBookingSummary();
        });
    }
    
    // Add event listeners for customer details
    const customerInputs = ['#customer-name', '#customer-email', '#customer-phone', '#customer-address'];
    customerInputs.forEach(selector => {
        const input = document.querySelector(selector);
        if (input) {
            input.addEventListener('input', function() {
                storeStepData(3);
                updateBookingSummary();
            });
        }
    });
    
    // Booking form navigation
    const nextButtons = document.querySelectorAll('.btn-next');
    const prevButtons = document.querySelectorAll('.btn-prev');
    const formSteps = document.querySelectorAll('.booking-form-step');
    const bookingSteps = document.querySelectorAll('.booking-step');
    
    if (nextButtons.length > 0) {
        nextButtons.forEach((button, index) => {
            button.addEventListener('click', function(e) {
                e.preventDefault();
                if (validateStep(index)) {
                    storeStepData(index);
                    formSteps[index].classList.remove('active');
                    formSteps[index + 1].classList.add('active');
                    bookingSteps[index].classList.remove('active');
                    bookingSteps[index].classList.add('completed');
                    bookingSteps[index + 1].classList.add('active');
                    if (index + 1 === formSteps.length - 2) {
                        updateBookingSummary();
                    }
                    const bookingContainer = document.querySelector('.booking-container');
                    if (bookingContainer) {
                        bookingContainer.scrollIntoView({ behavior: 'smooth' });
                    }
                }
            });
        });
    }
    
    if (prevButtons.length > 0) {
        prevButtons.forEach((button, index) => {
            button.addEventListener('click', function(e) {
                e.preventDefault();
                const stepIndex = index + 1;
                formSteps[stepIndex].classList.remove('active');
                formSteps[stepIndex - 1].classList.add('active');
                bookingSteps[stepIndex].classList.remove('active');
                bookingSteps[stepIndex - 1].classList.remove('completed');
                bookingSteps[stepIndex - 1].classList.add('active');
                const bookingContainer = document.querySelector('.booking-container');
                if (bookingContainer) {
                    bookingContainer.scrollIntoView({ behavior: 'smooth' });
                }
            });
        });
    }
    
    function storeStepData(stepIndex) {
        const currentStep = formSteps[stepIndex];
        if (stepIndex === 0) {
            const selectedService = currentStep.querySelector('.service-option.selected');
            if (selectedService) {
                sessionStorage.setItem('selectedService', selectedService.dataset.service);
                sessionStorage.setItem('serviceName', selectedService.querySelector('h4').textContent);
            }
        } else if (stepIndex === 1) {
            const selectedSize = currentStep.querySelector('.apartment-size.active');
            const selectedBathroom = document.querySelector('.bathroom-count.active');
            
            if (selectedSize) {
                sessionStorage.setItem('apartmentSize', selectedSize.dataset.size);
                sessionStorage.setItem('apartmentSizeText', selectedSize.textContent);
            } else if (selectedBathroom) {
                sessionStorage.setItem('apartmentSize', 'bathroom-count');
                sessionStorage.setItem('apartmentSizeText', `${selectedBathroom.dataset.count} Bathrooms`);
            }
            
            const furnishingOption = currentStep.querySelector('input[name="furnishing"]:checked');
            if (furnishingOption) {
                sessionStorage.setItem('furnishing', furnishingOption.value);
            }
            
            const selectedAddOns = currentStep.querySelectorAll('.add-on-service.selected');
            const addOns = Array.from(selectedAddOns).map(addon => ({
                name: addon.querySelector('.add-on-name').textContent,
                price: addon.dataset.price
            }));
            sessionStorage.setItem('addOns', JSON.stringify(addOns));
            
            const selectedPayment = currentStep.querySelector('.payment-option.selected');
            if (selectedPayment) {
                sessionStorage.setItem('paymentOption', selectedPayment.dataset.option);
                sessionStorage.setItem('paymentDiscount', selectedPayment.dataset.discount);
                sessionStorage.setItem('paymentName', selectedPayment.querySelector('.payment-name').textContent);
            }
        } else if (stepIndex === 2) {
            const dateInput = currentStep.querySelector('#service-date');
            const timeInput = currentStep.querySelector('#service-time');
            if (dateInput) sessionStorage.setItem('serviceDate', dateInput.value);
            if (timeInput) sessionStorage.setItem('serviceTime', timeInput.value);
        } else if (stepIndex === 3) {
            const nameInput = currentStep.querySelector('#customer-name');
            const emailInput = currentStep.querySelector('#customer-email');
            const phoneInput = currentStep.querySelector('#customer-phone');
            const addressInput = currentStep.querySelector('#customer-address');
            if (nameInput) sessionStorage.setItem('customerName', nameInput.value);
            if (emailInput) sessionStorage.setItem('customerEmail', emailInput.value);
            if (phoneInput) sessionStorage.setItem('customerPhone', phoneInput.value);
            if (addressInput) sessionStorage.setItem('customerAddress', addressInput.value);
        }
    }
    
    function validateStep(stepIndex) {
        const currentStep = formSteps[stepIndex];
        let isValid = true;
        
        if (stepIndex === 0) {
            if (!currentStep.querySelector('.service-option.selected')) {
                alert('Please select a service to continue.');
                isValid = false;
            }
        } else if (stepIndex === 1) {
            const selectedService = sessionStorage.getItem('selectedService');
            
            if (selectedService === 'bathroom-cleaning') {
                if (!document.querySelector('.bathroom-count.active')) {
                    alert('Please select the number of bathrooms to continue.');
                    isValid = false;
                }
            } else {
                if (!currentStep.querySelector('.apartment-size.active')) {
                    alert('Please select an apartment size to continue.');
                    isValid = false;
                }
            }
            
            if (!currentStep.querySelector('input[name="furnishing"]:checked')) {
                alert('Please select a furnishing option to continue.');
                isValid = false;
            } else if (!currentStep.querySelector('.payment-option.selected')) {
                alert('Please select a payment option to continue.');
                isValid = false;
            }
        } else if (stepIndex === 2) {
            const dateInput = currentStep.querySelector('#service-date');
            const timeInput = currentStep.querySelector('#service-time');
            if (!dateInput.value) {
                alert('Please select a date for your service.');
                isValid = false;
            } else if (!timeInput.value) {
                alert('Please select a time for your service.');
                isValid = false;
            } else {
                const selectedDate = new Date(dateInput.value);
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                if (selectedDate < today) {
                    alert('Please select a future date for your service.');
                    isValid = false;
                }
            }
        } else if (stepIndex === 3) {
            const nameInput = currentStep.querySelector('#customer-name');
            const emailInput = currentStep.querySelector('#customer-email');
            const phoneInput = currentStep.querySelector('#customer-phone');
            const addressInput = currentStep.querySelector('#customer-address');
            if (!nameInput.value.trim()) {
                alert('Please enter your name.');
                isValid = false;
            } else if (!emailInput.value.trim() || !/\S+@\S+\.\S+/.test(emailInput.value)) {
                alert('Please enter a valid email address.');
                isValid = false;
            } else if (!phoneInput.value.trim() || !/^\d{10,}$/.test(phoneInput.value.replace(/\s/g, ''))) {
                alert('Please enter a valid phone number (10+ digits).');
                isValid = false;
            } else if (!addressInput.value.trim()) {
                alert('Please enter your address.');
                isValid = false;
            }
        }
        return isValid;
    }
    
    function calculateServicePrice() {
        const selectedService = sessionStorage.getItem('selectedService');
        const apartmentSize = sessionStorage.getItem('apartmentSize');
        const furnishing = sessionStorage.getItem('furnishing') || 'furnished';
        
        let servicePrice = 0;
        
        if (selectedService === 'home-cleaning') {
            const furnishingKey = furnishing === 'furnished' ? 'furnished' : 'non-furnished';
            if (PRICING[selectedService][furnishingKey][apartmentSize]) {
                servicePrice = PRICING[selectedService][furnishingKey][apartmentSize];
            }
        } else if (selectedService === 'kitchen-cleaning') {
            if (PRICING[selectedService][apartmentSize]) {
                servicePrice = PRICING[selectedService][apartmentSize];
            }
        } else if (selectedService === 'bathroom-cleaning') {
            const bathroomCount = parseInt(sessionStorage.getItem('bathroomCount') || '3');
            const bathroomPrice = sessionStorage.getItem('bathroomPrice');
            servicePrice = bathroomPrice ? parseInt(bathroomPrice) : Math.max(bathroomCount * PRICING[selectedService].perBathroom, PRICING[selectedService].minimum);
        }
        
        return servicePrice;
    }
    
    function updateBookingSummary() {
        const summaryContainer = document.querySelector('.booking-summary');
        if (!summaryContainer) return;

        // Get service information
        const serviceName = sessionStorage.getItem('serviceName') || 'Not selected';
        const servicePrice = calculateServicePrice();
        
        const apartmentSizeText = sessionStorage.getItem('apartmentSizeText') || 'Not selected';
        const furnishing = sessionStorage.getItem('furnishing') ? 
            (sessionStorage.getItem('furnishing').charAt(0).toUpperCase() + sessionStorage.getItem('furnishing').slice(1)) : 'Not selected';
        
        // Calculate add-ons
        const addOns = JSON.parse(sessionStorage.getItem('addOns') || '[]');
        let addOnsText = 'None';
        let addOnsPrice = 0;
        if (addOns.length > 0) {
            addOnsText = addOns.map(addon => addon.name).join(', ');
            addOnsPrice = addOns.reduce((total, addon) => total + parseInt(addon.price), 0);
        }
        
        // Payment and discount
        const paymentName = sessionStorage.getItem('paymentName') || 'Not selected';
        const discount = parseInt(sessionStorage.getItem('paymentDiscount') || '0');
        
        // Date and time
        const serviceDate = sessionStorage.getItem('serviceDate');
        const serviceTime = sessionStorage.getItem('serviceTime');
        const dateTime = (serviceDate && serviceTime) ? 
            `${formatDate(serviceDate)} at ${formatTime(serviceTime)}` : 'Not specified';
        
        // Address
        const address = sessionStorage.getItem('customerAddress') || 'Not specified';
        
        // Calculate total
        const subtotal = servicePrice + addOnsPrice;
        const total = Math.max(0, subtotal - discount);
        
        // Update summary display
        const summaryElements = {
            '.summary-service': serviceName,
            '.summary-size': apartmentSizeText,
            '.summary-furnishing': furnishing,
            '.summary-addons': addOnsText,
            '.summary-payment': paymentName,
            '.summary-datetime': dateTime,
            '.summary-address': address,
            '.summary-total': `₹${total.toLocaleString()}`
        };
        
        Object.entries(summaryElements).forEach(([selector, value]) => {
            const element = summaryContainer.querySelector(selector);
            if (element) {
                element.textContent = value;
            }
        });
        
        console.log('Summary updated:', {
            serviceName, servicePrice, addOnsPrice, discount, total, address, apartmentSizeText
        });
    }
    
    function formatDate(dateString) {
        if (!dateString) return 'Not specified';
        const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        return new Date(dateString).toLocaleDateString('en-US', options);
    }
    
    function formatTime(timeString) {
        if (!timeString) return '';
        const [hours, minutes] = timeString.split(':');
        const hour = parseInt(hours);
        const ampm = hour >= 12 ? 'PM' : 'AM';
        const displayHour = hour % 12 || 12;
        return `${displayHour}:${minutes} ${ampm}`;
    }
    
    const bookingForm = document.querySelector('#booking-form');
    if (bookingForm) {
        bookingForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const termsCheckbox = this.querySelector('#terms-checkbox');
            if (!termsCheckbox.checked) {
                alert('Please agree to the Terms and Conditions to continue.');
                return;
            }

            const activeStep = document.querySelector('.booking-form-step.active');
            const successStep = document.querySelector('.booking-form-step.booking-success');
            const activeStepIndicator = document.querySelector('.booking-step.active');
            const lastStepIndicator = bookingSteps[bookingSteps.length - 1];

            activeStep.classList.remove('active');
            successStep.classList.add('active');
            
            activeStepIndicator.classList.remove('active');
            activeStepIndicator.classList.add('completed');
            lastStepIndicator.classList.add('active');
            
            const bookingContainer = document.querySelector('.booking-container');
            if (bookingContainer) {
                bookingContainer.scrollIntoView({ behavior: 'smooth' });
            }
            
            console.log('Booking submitted successfully!');
        });
    }

    // Initial setup and summary update
    setTimeout(() => {
        storeStepData(0);
        storeStepData(1);
        storeStepData(2);
        storeStepData(3);
        updateBookingSummary();
    }, 200);
}