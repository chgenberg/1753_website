// E-book Reader Application
class EBookReader {
    constructor() {
        this.pdfDoc = null;
        this.currentPageNum = 1;
        this.pageCount = 0;
        this.totalPages = 0;
        this.scale = 1.0;
        this.baseScale = 1.0; // Base scale for fitting to screen
        this.isLoading = false;
        this.isFullscreen = false;
        this.pageMode = 'double'; // 'single' or 'double'
        this.zoomLevel = 1.0; // Återställd till 1.0 för bättre initial storlek
        this.minZoom = 0.5;
        this.maxZoom = 3.0;
        
        // DOM elements
        this.loadingScreen = document.getElementById('loading');
        this.appContainer = document.getElementById('app');
        this.leftCanvas = document.getElementById('leftCanvas');
        this.rightCanvas = document.getElementById('rightCanvas');
        this.leftPage = document.getElementById('leftPage');
        this.rightPage = document.getElementById('rightPage');
        this.currentPageSpan = document.getElementById('currentPage');
        this.totalPagesSpan = document.getElementById('totalPages');
        this.progressFill = document.getElementById('progressFill');
        // Zoom level display removed
        
        // Loading progress elements
        this.loaderProgressFill = document.querySelector('.loader-progress-fill');
        this.loaderProgressText = document.querySelector('.loader-progress-text');
        
        // Navigation elements
        this.prevBtn = document.getElementById('prevBtn');
        this.nextBtn = document.getElementById('nextBtn');
        this.clickLeft = document.getElementById('clickLeft');
        this.clickRight = document.getElementById('clickRight');
        
        // Control elements
        this.firstBtn = document.getElementById('firstBtn');
        this.prevPageBtn = document.getElementById('prevPageBtn');
        this.nextPageBtn = document.getElementById('nextPageBtn');
        this.lastBtn = document.getElementById('lastBtn');
        this.zoomInBtn = document.getElementById('zoomInBtn');
        this.zoomOutBtn = document.getElementById('zoomOutBtn');
        this.zoomResetBtn = document.getElementById('zoomResetBtn');
        this.zoomLevelSpan = document.getElementById('zoomLevel');
        this.fullscreenBtn = document.getElementById('fullscreenBtn');
        this.downloadBtn = document.getElementById('downloadBtn');
        
        this.init();
    }
    
    async init() {
        try {
            // Configure PDF.js
            pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
            
            // Load PDF
            await this.loadPDF();
            
            // Setup event listeners
            this.setupEventListeners();
            
            // Initial render - start from page 1 (correct cover page)
            this.currentPageNum = 1;
            
            // Wait a bit to ensure DOM is ready
            await new Promise(resolve => setTimeout(resolve, 100));
            
            await this.renderPages();
            
            // Hide loading screen
            this.hideLoadingScreen();
            
            console.log('E-book reader initialized successfully');
            
        } catch (error) {
            console.error('Error initializing e-book reader:', error);
            this.showError('Kunde inte ladda e-boken. Försök igen senare.');
        }
    }
    
    async loadPDF() {
        try {
            // Update loading progress
            this.updateLoadingProgress(10, 'Ansluter till servern...');
            
            // Load the backup PDF (the correct file)
            const pdfTask = pdfjsLib.getDocument({
                url: '/e-book_weedyourskin_backup.pdf',
                cMapUrl: 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/cmaps/',
                cMapPacked: true,
                rangeChunkSize: 65536, // 64KB chunks for better streaming
                disableAutoFetch: false, // Allow auto-fetch for better performance
                disableStream: false, // Enable streaming
                onProgress: (progress) => {
                    if (progress.total > 0) {
                        const percent = Math.round((progress.loaded / progress.total) * 80) + 10;
                        this.updateLoadingProgress(percent, 'Laddar e-bok...');
                    }
                }
            });
            
            this.pdfDoc = await pdfTask.promise;
            this.pageCount = this.pdfDoc.numPages;
            this.totalPages = this.pageCount;
            this.totalPagesSpan.textContent = this.totalPages;
            
            this.updateLoadingProgress(95, 'Förbereder visning...');
            
            console.log(`E-book loaded: ${this.pageCount} pages`);
            console.log(`Starting on page: ${this.currentPageNum}`);
        } catch (error) {
            console.error('Error loading PDF:', error);
            throw error;
        }
    }
    
    updateLoadingProgress(percent, text) {
        if (this.loaderProgressFill) {
            this.loaderProgressFill.style.width = `${percent}%`;
        }
        if (this.loaderProgressText) {
            this.loaderProgressText.textContent = `${percent}%`;
        }
        if (text && document.querySelector('.loader-text')) {
            document.querySelector('.loader-text').textContent = text;
        }
    }
    
    setupEventListeners() {
        // Zoom controls
        document.getElementById('zoomInBtn').addEventListener('click', () => {
            this.zoom(this.zoomLevel + 0.1);
        });
        
        document.getElementById('zoomOutBtn').addEventListener('click', () => {
            this.zoom(this.zoomLevel - 0.1);
        });
        
        // Navigation
        document.getElementById('prevBtn').addEventListener('click', () => {
            this.previousPage();
        });
        
        document.getElementById('nextBtn').addEventListener('click', () => {
            this.nextPage();
        });
        
        // Click areas over sidorna (vänster / höger halva)
        document.getElementById('clickLeft').addEventListener('click', () => {
            if (this.zoomLevel <= 1.0) {
                this.previousPage();
            }
        });
        
        document.getElementById('clickRight').addEventListener('click', () => {
            if (this.zoomLevel <= 1.0) {
                this.nextPage();
            }
        });
        
        // Kontrollgruppsknappar (First/Prev/Next/Last) längst ned
        document.getElementById('firstBtn').addEventListener('click', () => this.goToPage(1));
        document.getElementById('prevPageBtn').addEventListener('click', () => this.previousPage());
        document.getElementById('nextPageBtn').addEventListener('click', () => this.nextPage());
        document.getElementById('lastBtn').addEventListener('click', () => this.goToPage(this.totalPages));
        
        // Visa navigationspilar efter kort fördröjning så de animeras in
        setTimeout(() => {
            this.showNavArrows();
        }, 300);
        
        // Fullscreen
        document.getElementById('fullscreenBtn').addEventListener('click', () => {
            this.toggleFullscreen();
        });
        
        // Download
        document.getElementById('downloadBtn').addEventListener('click', () => {
            this.downloadPDF();
        });
        
        // Keyboard navigation
        document.addEventListener('keydown', (e) => this.handleKeyboard(e));
        
        // Mouse wheel for zoom and scroll
        const bookContainer = document.querySelector('.book-container');
        bookContainer.addEventListener('wheel', (e) => this.handleWheel(e));
        
        // Add explicit touchpad support for Mac
        bookContainer.addEventListener('touchstart', (e) => {
            if (this.zoomLevel > 1.0 && e.touches.length === 2) {
                e.preventDefault();
                this.touchStartY = e.touches[0].clientY;
                this.touchStartX = e.touches[0].clientX;
            }
        }, { passive: false });
        
        bookContainer.addEventListener('touchmove', (e) => {
            if (this.zoomLevel > 1.0 && e.touches.length === 2) {
                e.preventDefault();
                const deltaY = e.touches[0].clientY - this.touchStartY;
                const deltaX = e.touches[0].clientX - this.touchStartX;
                
                bookContainer.scrollTop -= deltaY;
                bookContainer.scrollLeft -= deltaX;
                
                this.touchStartY = e.touches[0].clientY;
                this.touchStartX = e.touches[0].clientX;
            }
        }, { passive: false });
        
        // Add scroll event listener for debugging
        bookContainer.addEventListener('scroll', (e) => {
            if (this.zoomLevel > 1.0) {
                console.log('Scrolling detected:', {
                    scrollLeft: bookContainer.scrollLeft,
                    scrollTop: bookContainer.scrollTop,
                    scrollWidth: bookContainer.scrollWidth,
                    scrollHeight: bookContainer.scrollHeight
                });
            }
        });
        
        // Window resize
        window.addEventListener('resize', this.debounce(() => {
            this.handleResize();
        }, 250));
        
        // Setup touch gestures and drag-to-pan
        this.setupTouchGestures();
        this.setupDragToPan();
    }
    
    setupTouchGestures() {
        let startX = 0;
        let startY = 0;
        let initialDistance = 0;
        let isPinching = false;
        
        const bookContainer = document.querySelector('.book-container');
        
        // Handle pinch zoom
        bookContainer.addEventListener('touchstart', (e) => {
            if (e.touches.length === 2) {
                isPinching = true;
                const touch1 = e.touches[0];
                const touch2 = e.touches[1];
                initialDistance = Math.hypot(
                    touch2.clientX - touch1.clientX,
                    touch2.clientY - touch1.clientY
                );
            } else if (e.touches.length === 1) {
                startX = e.touches[0].clientX;
                startY = e.touches[0].clientY;
            }
        });
        
        bookContainer.addEventListener('touchmove', (e) => {
            if (isPinching && e.touches.length === 2) {
                e.preventDefault();
                const touch1 = e.touches[0];
                const touch2 = e.touches[1];
                const currentDistance = Math.hypot(
                    touch2.clientX - touch1.clientX,
                    touch2.clientY - touch1.clientY
                );
                
                const scale = currentDistance / initialDistance;
                const newZoom = this.zoomLevel * scale;
                this.zoom(newZoom);
                initialDistance = currentDistance;
            }
        });
        
        bookContainer.addEventListener('touchend', (e) => {
            if (isPinching && e.touches.length < 2) {
                isPinching = false;
            } else if (!isPinching && e.changedTouches.length === 1) {
                const endX = e.changedTouches[0].clientX;
                const endY = e.changedTouches[0].clientY;
                
                const deltaX = endX - startX;
                const deltaY = endY - startY;
                
                // Swipe threshold
                const threshold = 50;
                
                if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > threshold) {
                    if (deltaX > 0) {
                        this.previousPage();
                    } else {
                        this.nextPage();
                    }
                }
            }
        });
    }
    
    setupDragToPan() {
        const bookContainer = document.querySelector('.book-container');
        let isDragging = false;
        let startX, startY;
        let scrollLeft, scrollTop;
        
        // Prevent text selection while dragging
        bookContainer.addEventListener('selectstart', (e) => {
            if (isDragging) {
                e.preventDefault();
            }
        });
        
        bookContainer.addEventListener('mousedown', (e) => {
            // Only enable drag if zoomed and not clicking on controls or navigation areas
            if (this.zoomLevel <= 1.0 || 
                e.target.closest('.control-btn') || 
                e.target.closest('.nav-arrow') ||
                e.target.closest('.click-area')) {
                return;
            }
            
            isDragging = true;
            bookContainer.classList.add('dragging');
            startX = e.pageX - bookContainer.offsetLeft;
            startY = e.pageY - bookContainer.offsetTop;
            scrollLeft = bookContainer.scrollLeft;
            scrollTop = bookContainer.scrollTop;
            
            e.preventDefault();
        });
        
        document.addEventListener('mousemove', (e) => {
            if (!isDragging) return;
            
            e.preventDefault();
            const x = e.pageX - bookContainer.offsetLeft;
            const y = e.pageY - bookContainer.offsetTop;
            const walkX = (x - startX) * 1; // Scroll speed
            const walkY = (y - startY) * 1;
            bookContainer.scrollLeft = scrollLeft - walkX;
            bookContainer.scrollTop = scrollTop - walkY;
        });
        
        document.addEventListener('mouseup', () => {
            if (isDragging) {
                isDragging = false;
                bookContainer.classList.remove('dragging');
            }
        });
        
        // Touch support for mobile
        let touchStartX, touchStartY;
        
        bookContainer.addEventListener('touchstart', (e) => {
            if (this.zoomLevel <= 1.0) return;
            
            const touch = e.touches[0];
            touchStartX = touch.pageX - bookContainer.offsetLeft;
            touchStartY = touch.pageY - bookContainer.offsetTop;
            scrollLeft = bookContainer.scrollLeft;
            scrollTop = bookContainer.scrollTop;
        }, { passive: true });
        
        bookContainer.addEventListener('touchmove', (e) => {
            if (this.zoomLevel <= 1.0) return;
            
            const touch = e.touches[0];
            const x = touch.pageX - bookContainer.offsetLeft;
            const y = touch.pageY - bookContainer.offsetTop;
            const walkX = (x - touchStartX) * 1;
            const walkY = (y - touchStartY) * 1;
            bookContainer.scrollLeft = scrollLeft - walkX;
            bookContainer.scrollTop = scrollTop - walkY;
        }, { passive: true });
    }
    
    async renderPages() {
        if (!this.pdfDoc || this.isLoading) return;
        
        this.isLoading = true;
        
        try {
            // Force single page mode on mobile
            const isMobile = window.innerWidth < 768;
            if (isMobile) {
                this.pageMode = 'single';
            }
            
            if (this.pageMode === 'double') {
                await this.renderDoublePage();
            } else {
                await this.renderSinglePage();
            }
            
            this.updateUI();
        } catch (error) {
            console.error('Error rendering pages:', error);
            this.showError('Kunde inte visa sidan. Försök igen.');
        } finally {
            this.isLoading = false;
        }
    }
    
    async renderDoublePage() {
        // For the first page (cover), show it as a single page centered
        if (this.currentPageNum === 1) {
            await this.renderPageFromCorrectDoc(1, this.leftCanvas);
            this.leftPage.style.display = 'block';
            this.leftPage.style.width = '100%';
            this.rightPage.style.display = 'none';
            
            // Add class for single page styling
            document.querySelector('.page-container').classList.add('single-page-mode');
            document.querySelector('.book').classList.add('single-page');
            document.querySelector('.book').classList.add('cover-mode');
            return;
        }
        
        // Remove single page mode class when not on cover or mobile
        document.querySelector('.page-container').classList.remove('single-page-mode');
        document.querySelector('.book').classList.remove('single-page');
        document.querySelector('.book').classList.remove('cover-mode');
        
        // For pages after cover, show as spreads
        const adjustedPageNum = this.currentPageNum;
        
        // Calculate which pages to show in the spread
        let leftPageNum, rightPageNum;
        
        if (adjustedPageNum === 2) {
            // First spread after cover: pages 2-3
            leftPageNum = 2;
            rightPageNum = 3;
        } else {
            // Normal spread calculation
            leftPageNum = adjustedPageNum % 2 === 0 ? adjustedPageNum : adjustedPageNum - 1;
            rightPageNum = leftPageNum + 1;
        }
        
        // Render left page
        if (leftPageNum >= 2 && leftPageNum <= this.totalPages) {
            await this.renderPageFromCorrectDoc(leftPageNum, this.leftCanvas);
            this.leftPage.style.display = 'block';
            this.leftPage.style.width = '50%';
        } else {
            this.leftPage.style.display = 'none';
        }
        
        // Render right page
        if (rightPageNum <= this.totalPages) {
            await this.renderPageFromCorrectDoc(rightPageNum, this.rightCanvas);
            this.rightPage.style.display = 'block';
        } else {
            this.rightPage.style.display = 'none';
        }
    }
    
    async renderSinglePage() {
        await this.renderPageFromCorrectDoc(this.currentPageNum, this.leftCanvas);
        this.leftPage.style.display = 'block';
        this.leftPage.style.width = '100%';
        this.rightPage.style.display = 'none';
        
        // Add class for single page styling
        document.querySelector('.page-container').classList.add('single-page-mode');
        document.querySelector('.book').classList.add('single-page');
    }
    
    async renderPageFromCorrectDoc(pageNum, canvas) {
        // Always use the single merged PDF
        await this.renderPage(pageNum, canvas, this.pdfDoc);
    }
    
    async renderPage(pageNum, canvas, pdfDocument = this.pdfDoc) {
        try {
            console.log(`Rendering page ${pageNum} to canvas:`, canvas.id);
            const page = await pdfDocument.getPage(pageNum);
            
            // Calculate optimal scale for screen size
            const container = document.querySelector('.book-container');
            const containerWidth = container.offsetWidth;
            const containerHeight = container.offsetHeight;
            
            console.log(`Container dimensions: ${containerWidth}x${containerHeight}`);
            
            // Get original page dimensions
            const originalViewport = page.getViewport({ scale: 1.0 });
            console.log(`Original page dimensions: ${originalViewport.width}x${originalViewport.height}`);
            
            // Calculate scale based on whether it's a single page or double page
            let scaleX, scaleY, autoScale;
            
            // Check if we're showing a single page (cover or mobile mode)
            const isMobile = window.innerWidth < 768;
            const isSinglePage = isMobile || this.pageMode === 'single' || this.currentPageNum === 1;
            
            if (isSinglePage) {
                // For single pages, use more of the container width
                scaleX = (containerWidth * 0.9) / originalViewport.width;
                scaleY = (containerHeight * 0.98) / originalViewport.height;
                autoScale = Math.min(scaleX, scaleY); // Use min to fit within bounds
            } else {
                // For double pages, each page gets 50% of container width minus gap
                scaleX = (containerWidth * 0.48) / originalViewport.width;
                scaleY = (containerHeight * 0.98) / originalViewport.height;
                autoScale = Math.min(scaleX, scaleY); // Use min to fit within bounds
            }
            
            // Apply zoom level
            autoScale = autoScale * this.zoomLevel;
            
            // Don't use quality multiplier for initial render, only for zoom
            const qualityMultiplier = this.zoomLevel > 1 ? 2.0 : 1.5;
            const finalScale = autoScale * qualityMultiplier;
            
            console.log(`Calculated scales - X: ${scaleX}, Y: ${scaleY}, Final: ${finalScale}, Zoom: ${this.zoomLevel}`);
            
            const viewport = page.getViewport({ scale: finalScale });
            
            const context = canvas.getContext('2d');
            
            // Set canvas size
            canvas.width = viewport.width;
            canvas.height = viewport.height;
            
            // Set canvas style to maintain aspect ratio and center
            canvas.style.width = `${viewport.width / qualityMultiplier}px`;
            canvas.style.height = `${viewport.height / qualityMultiplier}px`;
            
            // Remove max-width/height constraints when zoomed
            if (this.zoomLevel > 1.0) {
                canvas.style.maxWidth = 'none';
                canvas.style.maxHeight = 'none';
                canvas.style.width = `${viewport.width / qualityMultiplier}px`;
                canvas.style.height = `${viewport.height / qualityMultiplier}px`;
            } else {
                canvas.style.maxWidth = '100%';
                canvas.style.maxHeight = '100%';
            }
            
            canvas.style.objectFit = 'contain';
            canvas.style.display = 'block';
            canvas.style.margin = '0 auto';
            
            console.log(`Canvas size set to: ${canvas.width}x${canvas.height}`);
            
            // Clear canvas and set high quality rendering
            context.clearRect(0, 0, canvas.width, canvas.height);
            context.imageSmoothingEnabled = true;
            context.imageSmoothingQuality = 'high';
            
            const renderContext = {
                canvasContext: context,
                viewport: viewport,
                enableWebGL: true, // Enable WebGL for better performance
                renderInteractiveForms: false,
                renderTextLayer: false,
                renderAnnotationLayer: false
            };
            
            await page.render(renderContext).promise;
            console.log(`Successfully rendered page ${pageNum} with zoom ${this.zoomLevel}`);
        } catch (error) {
            console.error(`Error rendering page ${pageNum}:`, error);
            throw error;
        }
    }
    
    previousPage() {
        if (this.currentPageNum > 1) {
            const isMobile = window.innerWidth < 768;
            
            if (isMobile || this.pageMode === 'single') {
                // Single page mode - always go back by 1
                this.currentPageNum = this.currentPageNum - 1;
            } else if (this.currentPageNum === 2) {
                // From first spread back to cover on desktop
                this.currentPageNum = 1;
            } else {
                // Double page mode on desktop, go back by 2
                this.currentPageNum = Math.max(1, this.currentPageNum - 2);
            }
            this.renderPages();
            this.animatePageTurn('left');
        }
    }
    
    nextPage() {
        if (this.currentPageNum < this.totalPages) {
            const isMobile = window.innerWidth < 768;
            
            if (isMobile || this.pageMode === 'single') {
                // Single page mode - always advance by 1
                this.currentPageNum = this.currentPageNum + 1;
            } else if (this.currentPageNum === 1) {
                // From cover on desktop, go to page 2 (which will show pages 2-3)
                this.currentPageNum = 2;
            } else {
                // Double page mode on desktop, advance by 2
                this.currentPageNum = Math.min(this.totalPages, this.currentPageNum + 2);
            }
            this.renderPages();
            this.animatePageTurn('right');
        }
    }
    
    goToPage(pageNum) {
        if (pageNum >= 1 && pageNum <= this.totalPages) {
            this.currentPageNum = pageNum;
            this.renderPages();
        }
    }
    
    handleWheel(e) {
        const bookContainer = document.querySelector('.book-container');
        
        // If zoomed in, allow normal scrolling
        if (this.zoomLevel > 1.0) {
            // Don't prevent default for normal scrolling when zoomed
            console.log('Wheel event when zoomed:', {
                deltaX: e.deltaX,
                deltaY: e.deltaY,
                ctrlKey: e.ctrlKey,
                metaKey: e.metaKey,
                currentScroll: {
                    left: bookContainer.scrollLeft,
                    top: bookContainer.scrollTop
                }
            });
            
            // If it's a zoom gesture (Ctrl/Cmd + wheel), handle zoom
            if (e.ctrlKey || e.metaKey) {
                e.preventDefault();
                const delta = e.deltaY > 0 ? -0.1 : 0.1;
                this.zoom(this.zoomLevel + delta);
            }
            // Otherwise, let the browser handle normal scrolling
            return;
        }
        
        // If not zoomed, only handle zoom with Ctrl/Cmd
        if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            const delta = e.deltaY > 0 ? -0.1 : 0.1;
            this.zoom(this.zoomLevel + delta);
        }
    }
    
    zoom(newZoom) {
        this.zoomLevel = Math.max(this.minZoom, Math.min(this.maxZoom, newZoom));
        this.updateZoomDisplay();
        
        // Add/remove zoomed class for scrolling
        const bookContainer = document.querySelector('.book-container');
        if (this.zoomLevel > 1.0) {
            bookContainer.classList.add('zoomed');
            
            // Disable click areas while zoomed so they don't block scrolling
            document.querySelectorAll('.click-area').forEach(el => {
                el.style.pointerEvents = 'none';
            });
            
            // Force scroll by ensuring content is larger than container
            setTimeout(() => {
                const containerWidth = bookContainer.clientWidth;
                const containerHeight = bookContainer.clientHeight;
                const scrollWidth = bookContainer.scrollWidth;
                const scrollHeight = bookContainer.scrollHeight;
                
                console.log('After render:', {
                    containerWidth,
                    containerHeight,
                    scrollWidth,
                    scrollHeight,
                    canScrollX: scrollWidth > containerWidth,
                    canScrollY: scrollHeight > containerHeight
                });
                
                // If content is not scrollable, force it to be
                if (scrollWidth <= containerWidth || scrollHeight <= containerHeight) {
                    console.log('Forcing scroll by adjusting container layout');
                    const book = bookContainer.querySelector('.book');
                    if (book) {
                        book.style.minWidth = (containerWidth + 100) + 'px';
                        book.style.minHeight = (containerHeight + 100) + 'px';
                    }
                }
                
                // Center horizontally and vertically
                bookContainer.scrollLeft = (scrollWidth - containerWidth) / 2;
                bookContainer.scrollTop = (scrollHeight - containerHeight) / 2;
            }, 100);
        } else {
            bookContainer.classList.remove('zoomed');
            
            // Re-enable click areas when not zoomed
            document.querySelectorAll('.click-area').forEach(el => {
                el.style.pointerEvents = '';
            });
            
            bookContainer.scrollLeft = 0;
            bookContainer.scrollTop = 0;
            // Reset forced dimensions
            const book = bookContainer.querySelector('.book');
            if (book) {
                book.style.minWidth = '';
                book.style.minHeight = '';
            }
        }
        
        this.renderPages();
    }
    
    updateZoomDisplay() {
        if (this.zoomLevelSpan) {
            this.zoomLevelSpan.textContent = `${Math.round(this.zoomLevel * 100)}%`;
        }
    }
    
    toggleFullscreen() {
        if (!this.isFullscreen) {
            this.enterFullscreen();
        } else {
            this.exitFullscreen();
        }
    }
    
    enterFullscreen() {
        this.appContainer.classList.add('fullscreen');
        this.isFullscreen = true;
        
        // Hide product recommendations in fullscreen
        const recommendations = document.querySelector('.product-recommendations');
        if (recommendations) {
            recommendations.style.display = 'none';
        }
        
        // Try to enter browser fullscreen
        if (this.appContainer.requestFullscreen) {
            this.appContainer.requestFullscreen();
        } else if (this.appContainer.webkitRequestFullscreen) {
            this.appContainer.webkitRequestFullscreen();
        } else if (this.appContainer.msRequestFullscreen) {
            this.appContainer.msRequestFullscreen();
        }
    }
    
    exitFullscreen() {
        this.appContainer.classList.remove('fullscreen');
        this.isFullscreen = false;
        
        // Show product recommendations again
        const recommendations = document.querySelector('.product-recommendations');
        if (recommendations) {
            recommendations.style.display = 'block';
        }
        
        // Exit browser fullscreen
        if (document.exitFullscreen) {
            document.exitFullscreen();
        } else if (document.webkitExitFullscreen) {
            document.webkitExitFullscreen();
        } else if (document.msExitFullscreen) {
            document.msExitFullscreen();
        }
    }
    
    handleKeyboard(e) {
        const bookContainer = document.querySelector('.book-container');
        
        // If zoomed in and content is actually scrollable, use arrow keys for scrolling
        if (this.zoomLevel > 1.0) {
            const canScrollX = bookContainer.scrollWidth > bookContainer.clientWidth;
            const canScrollY = bookContainer.scrollHeight > bookContainer.clientHeight;
            
            // Only intercept arrow keys if we can actually scroll in that direction
            const scrollAmount = 50;
            switch(e.key) {
                case 'ArrowUp':
                    if (canScrollY && bookContainer.scrollTop > 0) {
                        e.preventDefault();
                        bookContainer.scrollTop -= scrollAmount;
                        console.log('Scrolled up with arrow key');
                        return;
                    }
                    break;
                case 'ArrowDown':
                    if (canScrollY && bookContainer.scrollTop < bookContainer.scrollHeight - bookContainer.clientHeight) {
                        e.preventDefault();
                        bookContainer.scrollTop += scrollAmount;
                        console.log('Scrolled down with arrow key');
                        return;
                    }
                    break;
                case 'ArrowLeft':
                    if (canScrollX && bookContainer.scrollLeft > 0) {
                        e.preventDefault();
                        bookContainer.scrollLeft -= scrollAmount;
                        console.log('Scrolled left with arrow key');
                        return;
                    }
                    break;
                case 'ArrowRight':
                    if (canScrollX && bookContainer.scrollLeft < bookContainer.scrollWidth - bookContainer.clientWidth) {
                        e.preventDefault();
                        bookContainer.scrollLeft += scrollAmount;
                        console.log('Scrolled right with arrow key');
                        return;
                    }
                    break;
            }
        }
        
        // Normal keyboard navigation (when not zoomed or can't scroll)
        switch(e.key) {
            case 'ArrowLeft':
            case 'ArrowUp':
            case 'PageUp':
                e.preventDefault();
                this.previousPage();
                break;
            case 'ArrowRight':
            case 'ArrowDown':
            case 'PageDown':
            case ' ':
                e.preventDefault();
                this.nextPage();
                break;
            case 'Home':
                e.preventDefault();
                this.goToPage(1);
                break;
            case 'End':
                e.preventDefault();
                this.goToPage(this.totalPages);
                break;
            case 'f':
            case 'F':
                if (!e.ctrlKey && !e.metaKey) {
                    e.preventDefault();
                    this.toggleFullscreen();
                }
                break;
            case 'Escape':
                if (document.fullscreenElement) {
                    e.preventDefault();
                    this.exitFullscreen();
                }
                break;
            case '+':
            case '=':
                if (e.ctrlKey || e.metaKey) {
                    e.preventDefault();
                    this.zoom(this.zoomLevel + 0.1);
                }
                break;
            case '-':
                if (e.ctrlKey || e.metaKey) {
                    e.preventDefault();
                    this.zoom(this.zoomLevel - 0.1);
                }
                break;
            case '0':
                if (e.ctrlKey || e.metaKey) {
                    e.preventDefault();
                    this.zoom(1.0);
                }
                break;
        }
    }
    
    handleResize() {
        // Adjust page mode based on window size
        const container = document.querySelector('.book-container');
        const containerWidth = container.offsetWidth;
        const isMobile = window.innerWidth < 768;
        
        if (isMobile) {
            this.pageMode = 'single';
            // Force single page rendering on mobile
            document.querySelector('.book').classList.add('mobile-view');
        } else {
            this.pageMode = 'double';
            document.querySelector('.book').classList.remove('mobile-view');
        }
        
        this.renderPages();
    }
    
    animatePageTurn(direction) {
        const book = document.getElementById('book');
        const animationClass = direction === 'left' ? 'page-turn-left' : 'page-turn-right';
        
        book.classList.add(animationClass);
        
        setTimeout(() => {
            book.classList.remove(animationClass);
        }, 600);
    }
    
    showNavArrows() {
        this.prevBtn.classList.add('visible');
        this.nextBtn.classList.add('visible');
    }
    
    hideNavArrows() {
        this.prevBtn.classList.remove('visible');
        this.nextBtn.classList.remove('visible');
    }
    
    updateUI() {
        // Update page numbers
        this.currentPageSpan.textContent = this.currentPageNum;
        
        // Update navigation buttons
        this.prevBtn.disabled = this.currentPageNum === 1;
        this.nextBtn.disabled = this.currentPageNum === this.totalPages;
        this.prevPageBtn.disabled = this.currentPageNum === 1;
        this.nextPageBtn.disabled = this.currentPageNum === this.totalPages;
        this.firstBtn.disabled = this.currentPageNum === 1;
        this.lastBtn.disabled = this.currentPageNum === this.totalPages;
        
        // Update zoom display
        this.updateZoomDisplay();
        
        // Update progress bar
        const progress = ((this.currentPageNum - 1) / (this.totalPages - 1)) * 100;
        this.progressFill.style.width = `${progress}%`;
        
        // Add/remove classes based on page
        if (this.currentPageNum === 1) {
            document.querySelector('.book').classList.add('cover-page');
        } else {
            document.querySelector('.book').classList.remove('cover-page');
        }
    }
    
    hideLoadingScreen() {
        // Complete the progress bar
        this.updateLoadingProgress(100, 'Klar!');
        
        setTimeout(() => {
            this.loadingScreen.classList.add('hidden');
            this.appContainer.classList.add('loaded');
            
            setTimeout(() => {
                this.loadingScreen.style.display = 'none';
            }, 500);
        }, 300);
    }
    
    showError(message) {
        // Simple error display
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: #dc3545;
            color: white;
            padding: 20px;
            border-radius: 8px;
            z-index: 10000;
            text-align: center;
            max-width: 300px;
        `;
        errorDiv.textContent = message;
        
        document.body.appendChild(errorDiv);
        
        setTimeout(() => {
            errorDiv.remove();
        }, 5000);
    }
    
    // Utility function for debouncing
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }
    
    // Download PDF function
    downloadPDF() {
        // Create a temporary link element
        const link = document.createElement('a');
        link.href = '/e-book_weedyourskin_backup.pdf';
        link.download = 'weed-your-skin-ebook.pdf';
        
        // Add animation to button
        this.downloadBtn.classList.add('downloading');
        
        // Trigger download
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        // Remove animation after delay
        setTimeout(() => {
            this.downloadBtn.classList.remove('downloading');
        }, 1000);
    }
}

// Initialize the e-book reader when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new EBookReader();
});

// Service Worker for offline support (optional)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then(registration => {
                console.log('SW registered: ', registration);
            })
            .catch(registrationError => {
                console.log('SW registration failed: ', registrationError);
            });
    });
}