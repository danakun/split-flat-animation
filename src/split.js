// Constants
const CHARSET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789.,:;-+/!?@#$%&*() ";
const ANIMATION_DURATION = 178; // ms 
const FLIP_TIMING = "cubic-bezier(0.34, 1.56, 0.64, 1)"; // Bouncy, realistic curve

// State
const state = {
    textTop: "FLUID ANIMATION",    // Text for top half of flaps
    textBottom: "IMMERSIVE DESIGN", // Text for bottom half of flaps
    isAnimating: false
};

// DOM Elements
const elements = {
    displayRow: document.getElementById('displayRow'),
    phraseBtns: document.querySelectorAll('.phrase-btn'),
    textInputTop: document.getElementById('textInputTop'),
    textInputBottom: document.getElementById('textInputBottom'),
    animateBtn: document.getElementById('animateBtn')
};

// Create a single flap element
const createFlap = (topChar = ' ', bottomChar = ' ') => {
    const flap = document.createElement('div');
    flap.className = 'flap';
    
    const flapTop = document.createElement('div');
    flapTop.className = 'flap-top';
    flapTop.textContent = topChar;
    
    const flapBottom = document.createElement('div');
    flapBottom.className = 'flap-bottom';
    flapBottom.textContent = bottomChar;
    
    const flapFlip = document.createElement('div');
    flapFlip.className = 'flap-flip';
    flapFlip.textContent = topChar;
    
    flap.append(flapTop, flapBottom, flapFlip);
    
    return flap;
};

// Get random character from charset
const getRandomChar = () => 
    CHARSET[Math.floor(Math.random() * CHARSET.length)];

// Animate a dual flap (different top and bottom characters)
const animateDualFlap = (flap, topTargetChar, bottomTargetChar, delay, onComplete) => {
    const flapTop = flap.querySelector('.flap-top');
    const flapBottom = flap.querySelector('.flap-bottom');
    const flapFlip = flap.querySelector('.flap-flip');
    
    // Current characters
    const currentTopChar = flapTop.textContent;
    const currentBottomChar = flapBottom.textContent;
    
    // Skip animation if characters are already correct
    if (currentTopChar === topTargetChar && currentBottomChar === bottomTargetChar) {
        if (onComplete) onComplete();
        return;
    }
    
    // Random number of shuffles - more shuffles for more realism
    const shuffles = 4 + Math.floor(Math.random() * 6);
    
    // Animate through random characters
    const animateShuffles = (index) => {
        if (index > shuffles) {
            if (onComplete) onComplete();
            return;
        }
        
        // Select next characters, with preference for characters similar to targets
        // near the end of the shuffle for more realistic transition
        let nextTopChar, nextBottomChar;
        
        if (index === shuffles) {
            // Final characters are the targets
            nextTopChar = topTargetChar;
            nextBottomChar = bottomTargetChar;
        } else if (index > shuffles - 2) {
            // For last few shuffles, try to pick characters closer to target
            const topTargetIndex = CHARSET.indexOf(topTargetChar);
            const bottomTargetIndex = CHARSET.indexOf(bottomTargetChar);
            
            if (topTargetIndex >= 0) {
                const range = 5;
                const minIndex = Math.max(0, topTargetIndex - range);
                const maxIndex = Math.min(CHARSET.length - 1, topTargetIndex + range);
                nextTopChar = CHARSET[minIndex + Math.floor(Math.random() * (maxIndex - minIndex))];
            } else {
                nextTopChar = getRandomChar();
            }
            
            if (bottomTargetIndex >= 0) {
                const range = 5;
                const minIndex = Math.max(0, bottomTargetIndex - range);
                const maxIndex = Math.min(CHARSET.length - 1, bottomTargetIndex + range);
                nextBottomChar = CHARSET[minIndex + Math.floor(Math.random() * (maxIndex - minIndex))];
            } else {
                nextBottomChar = getRandomChar();
            }
        } else {
            // Random characters for earlier shuffles
            nextTopChar = getRandomChar();
            nextBottomChar = getRandomChar();
        }
        
        // Calculate slightly variable timing for more realism
        const variableDuration = ANIMATION_DURATION * (0.9 + Math.random() * 0.2);
        
        setTimeout(() => {
            // Flip animation - flip shows the current top character
            flapFlip.textContent = currentTopChar;
            flapFlip.style.animation = 'none';
            void flapFlip.offsetWidth; // Force reflow
            flapFlip.style.animation = `flip ${variableDuration}ms ${FLIP_TIMING} forwards`;
            
            // Update bottom flap immediately to show the next bottom character
            flapBottom.textContent = nextBottomChar;
            
            // Update top flap after animation to show the next top character
            setTimeout(() => {
                flapTop.textContent = nextTopChar;
                
                // Slight pause between flips for mechanical feel
                setTimeout(() => {
                    animateShuffles(index + 1);
                }, variableDuration * 0.1);
                
            }, variableDuration * 0.75);
            
        }, index === 0 ? delay : 0);
    };
    
    // Start animation
    animateShuffles(0);
};

// Animate all flaps for text
const animateText = (forceAll = false) => {
    if (state.isAnimating) return;
    state.isAnimating = true;
    
    const flaps = elements.displayRow.querySelectorAll('.flap');
    
    // Track animations for completion
    let pendingAnimations = 0;
    
    // Center text in row
    const paddingTop = Math.floor((flaps.length - state.textTop.length) / 2);
    const paddingBottom = Math.floor((flaps.length - state.textBottom.length) / 2);
    
    // Animate each flap in the row
    flaps.forEach((flap, i) => {
        // Determine target characters for top and bottom
        let topChar = ' ';
        let bottomChar = ' ';
        
        const topTextIndex = i - paddingTop;
        if (topTextIndex >= 0 && topTextIndex < state.textTop.length) {
            topChar = state.textTop[topTextIndex];
        }
        
        const bottomTextIndex = i - paddingBottom;
        if (bottomTextIndex >= 0 && bottomTextIndex < state.textBottom.length) {
            bottomChar = state.textBottom[bottomTextIndex];
        }
        
        // Skip if characters already match and not forcing all
        const currentTopChar = flap.querySelector('.flap-top').textContent;
        const currentBottomChar = flap.querySelector('.flap-bottom').textContent;
        
        if (!forceAll && currentTopChar === topChar && currentBottomChar === bottomChar) {
            return;
        }
        
        // Track this animation
        pendingAnimations++;
        
        // Calculate delay with center-out pattern
        const distFromCenter = Math.abs(i - Math.floor(flaps.length / 2));
        const delay = distFromCenter * 30; // 30ms per unit from center
        
        // Animate this flap with different top and bottom characters
        animateDualFlap(flap, topChar, bottomChar, delay, () => {
            pendingAnimations--;
            if (pendingAnimations === 0) {
                state.isAnimating = false;
            }
        });
    });
    
    // If no animations were needed, reset state
    if (pendingAnimations === 0) {
        state.isAnimating = false;
    }
};

// Update text for top half of flaps
const updateTextTop = (text) => {
    state.textTop = text.toUpperCase();
    
    // Update active button
    elements.phraseBtns.forEach(btn => {
        const isActive = btn.dataset.textTop === state.textTop && 
                         btn.dataset.textBottom === state.textBottom;
        btn.classList.toggle('active', isActive);
    });
    
    // Update input if it doesn't match
    if (elements.textInputTop.value.toUpperCase() !== state.textTop) {
        elements.textInputTop.value = state.textTop;
    }
};

// Update text for bottom half of flaps
const updateTextBottom = (text) => {
    state.textBottom = text.toUpperCase();
    
    // Update active button
    elements.phraseBtns.forEach(btn => {
        const isActive = btn.dataset.textTop === state.textTop && 
                         btn.dataset.textBottom === state.textBottom;
        btn.classList.toggle('active', isActive);
    });
    
    // Update input if it doesn't match
    if (elements.textInputBottom.value.toUpperCase() !== state.textBottom) {
        elements.textInputBottom.value = state.textBottom;
    }
};

// Add hover effects to flaps
const addFlapHoverEffects = () => {
    document.querySelectorAll('.flap').forEach((flap, index) => {
        let restoreTimeout = null;
        
        flap.addEventListener('mouseenter', () => {
            if (state.isAnimating) return;
            
            // Clear any existing timeout
            if (restoreTimeout) {
                clearTimeout(restoreTimeout);
                restoreTimeout = null;
            }
            
            const flapTop = flap.querySelector('.flap-top');
            const flapBottom = flap.querySelector('.flap-bottom');
            const flapFlip = flap.querySelector('.flap-flip');
            
            // Get current character
            const currentTopChar = flapTop.textContent;
            
            // Generate random characters
            const randomTopChar = getRandomChar();
            const randomBottomChar = getRandomChar();
            
            // Animate to random characters
            flapFlip.textContent = currentTopChar;
            flapFlip.style.animation = 'none';
            void flapFlip.offsetWidth;
            flapFlip.style.animation = `flip ${ANIMATION_DURATION}ms ${FLIP_TIMING} forwards`;
            
            flapBottom.textContent = randomBottomChar;
            
            setTimeout(() => {
                flapTop.textContent = randomTopChar;
                
                // Set timeout to restore - just trigger a full re-animation
                restoreTimeout = setTimeout(() => {
                    // Simply re-run the animation for this single flap
                    animateText(true);
                    restoreTimeout = null;
                }, 800);
                
            }, ANIMATION_DURATION * 0.75);
        });
    });
};

// Initialize a row with random characters first
const initializeDualRowWithRandom = (row, count) => {
    row.innerHTML = '';
    
    // Create flaps with random characters initially
    for (let i = 0; i < count; i++) {
        const randomTopChar = getRandomChar();
        const randomBottomChar = getRandomChar();
        row.appendChild(createFlap(randomTopChar, randomBottomChar));
    }
};

// Initialize the display
const initialize = () => {
    // Set initial text
    updateTextTop("FLUID ANIMATION");
    updateTextBottom("IMMERSIVE DESIGN");
    
    // Set up display row with random characters initially
    initializeDualRowWithRandom(elements.displayRow, 18);
    
    // Add hover effects
    addFlapHoverEffects();
    
    // Start animation immediately as letters appear
    setTimeout(() => {
        animateText(true);
    }, 800); // Match CSS fade-in duration exactly
};

// Event Listeners
elements.phraseBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        if (btn.dataset.textTop && btn.dataset.textBottom) {
            updateTextTop(btn.dataset.textTop);
            updateTextBottom(btn.dataset.textBottom);
            animateText(true);
        }
    });
});

elements.textInputTop.addEventListener('input', () => {
    updateTextTop(elements.textInputTop.value);
});

elements.textInputBottom.addEventListener('input', () => {
    updateTextBottom(elements.textInputBottom.value);
});

elements.animateBtn.addEventListener('click', () => {
    animateText(true);
});

// Initialize when DOM is fully loaded
document.addEventListener('DOMContentLoaded', initialize);

// Run initialize immediately if document is already loaded
if (document.readyState === 'complete' || document.readyState === 'interactive') {
    initialize();
}
