
        // Cache for storing fetched characters
        const characterCache = new Map();
        let currentPage = 1;
        let totalPages = 0;
        const charactersPerPage = 50;
        let allCharacters = [];
        let selectedFilter = 'all';
        let isFetching = false;

        // Predefined character traits mapping for better matching
        const characterTraitMapping = {
            "Simba": ["brave", "loyal", "determined", "family", "adventurous", "leadership"],
            "Ariel": ["curious", "adventurous", "determined", "family", "brave", "dreamer"],
            "Mickey Mouse": ["optimistic", "funny", "brave", "kind", "friendship", "energetic"],
            "Elsa": ["compassionate", "determined", "brave", "kind", "family", "creative", "introverted"],
            "Genie": ["funny", "kind", "compassionate", "optimistic", "friendship", "creative", "extroverted"],
            "Moana": ["brave", "determined", "adventurous", "compassionate", "family", "spiritual"],
            "Woody": ["loyal", "brave", "kind", "determined", "friendship", "leadership"],
            "Rapunzel": ["curious", "optimistic", "brave", "kind", "adventurous", "creative", "dreamer"],
            "Mufasa": ["wise", "brave", "kind", "compassionate", "family", "leadership"],
            "Ursula": ["clever", "determined", "creative", "ambitious", "powerful"],
            "Cinderella": ["kind", "optimistic", "compassionate", "determined", "patient", "humble"],
            "Belle": ["kind", "curious", "brave", "compassionate", "knowledge", "dreamer"],
            "Aladdin": ["brave", "adventurous", "kind", "determined", "friendship", "street-smart"],
            "Jasmine": ["brave", "determined", "kind", "freedom", "adventurous", "independent"],
            "Peter Pan": ["adventurous", "funny", "determined", "freedom", "optimistic", "youthful"],
            "Captain Hook": ["clever", "determined", "ambitious", "strategic"],
            "Tinker Bell": ["determined", "loyal", "brave", "kind", "energetic", "spirited"],
            "Buzz Lightyear": ["brave", "loyal", "determined", "adventurous", "heroic"],
            "Mike Wazowski": ["funny", "optimistic", "determined", "loyal", "energetic"],
            "Sulley": ["kind", "compassionate", "loyal", "brave", "protective"],
            "Anna": ["optimistic", "kind", "determined", "loyal", "family", "extroverted"],
            "Olaf": ["funny", "optimistic", "kind", "loyal", "friendship", "innocent"],
            "Hercules": ["brave", "determined", "strong", "loyal", "family", "heroic"],
            "Megara": ["brave", "clever", "determined", "loyal", "independent", "witty"],
            "Stitch": ["adventurous", "loyal", "brave", "determined", "family", "mischievous"],
            "Mulan": ["brave", "determined", "loyal", "family", "honesty", "sacrifice"],
            "Mushu": ["funny", "determined", "brave", "loyal", "energetic"],
            "Pocahontas": ["brave", "compassionate", "determined", "family", "freedom", "spiritual"],
            "Tarzan": ["brave", "adventurous", "determined", "family", "loyal", "athletic"],
            "Jane Porter": ["curious", "kind", "compassionate", "knowledge", "adventurous"],
            "Beast": ["kind", "compassionate", "loyal", "family", "protective", "patient"],
            "Snow White": ["kind", "optimistic", "compassionate", "friendly", "gentle"],
            "Dopey": ["funny", "kind", "optimistic", "innocent"],
            "Grumpy": ["determined", "honest", "practical", "blunt"],
            "Doc": ["wise", "knowledge", "clever", "leadership"],
            "Prince Charming": ["kind", "brave", "determined", "charming"],
            "Maleficent": ["clever", "determined", "powerful", "ambitious", "strategic"],
            "Cruella de Vil": ["determined", "creative", "ambitious", "eccentric"],
            "Scar": ["clever", "determined", "ambitious", "strategic"],
            "Jafar": ["clever", "determined", "powerful", "ambitious", "deceptive"],
            "Hades": ["funny", "clever", "determined", "sarcastic", "ambitious"],
            "Captain Jack Sparrow": ["funny", "clever", "adventurous", "determined", "eccentric"],
            "Dory": ["optimistic", "kind", "determined", "loyal", "forgetful"],
            "Nemo": ["curious", "brave", "determined", "adventurous", "resilient"],
            "Marlin": ["determined", "brave", "family", "loyal", "protective"],
            "Lightning McQueen": ["determined", "brave", "adventurous", "loyal", "competitive"],
            "Mater": ["funny", "loyal", "optimistic", "friendly", "rustic"],
            "Mr. Incredible": ["brave", "strong", "family", "determined", "heroic"],
            "Elastigirl": ["brave", "flexible", "family", "clever", "leadership"],
            "Dash": ["adventurous", "determined", "brave", "funny", "energetic"],
            "Violet": ["brave", "determined", "family", "shy", "introverted"],
            "Jack Skellington": ["creative", "determined", "curious", "brave", "innovative"],
            "Sally": ["kind", "compassionate", "creative", "determined", "resourceful"],
            "Winnie the Pooh": ["kind", "friendly", "optimistic", "loyal", "thoughtful"],
            "Tigger": ["funny", "energetic", "optimistic", "adventurous", "bouncy"],
            "Piglet": ["kind", "loyal", "compassionate", "brave", "timid"],
            "Eeyore": ["honest", "loyal", "compassionate", "pessimistic", "resilient"],
            "Christopher Robin": ["kind", "loyal", "compassionate", "wise", "imaginative"]
        };

        document.addEventListener('DOMContentLoaded', function() {
            const traitItems = document.querySelectorAll('.trait-item');
            const findMatchBtn = document.getElementById('findMatchBtn');
            const resetBtn = document.getElementById('resetBtn');
            const resultContainer = document.getElementById('resultContainer');
            const tabs = document.querySelectorAll('.tab');
            const tabContents = document.querySelectorAll('.tab-content');
            const filterOptions = document.querySelectorAll('.filter-option');
            const apiInfo = document.getElementById('apiInfo');
            
            let selectedTraits = [];
            
            // Initialize the app
            initApp();
            
            // Tab switching
            tabs.forEach(tab => {
                tab.addEventListener('click', () => {
                    const tabId = tab.getAttribute('data-tab');
                    
                    // Update active tab
                    tabs.forEach(t => t.classList.remove('active'));
                    tab.classList.add('active');
                    
                    // Show corresponding content
                    tabContents.forEach(content => {
                        content.classList.remove('active');
                        if (content.id === `${tabId}-tab`) {
                            content.classList.add('active');
                        }
                    });
                });
            });
            
            // Filter selection
            filterOptions.forEach(option => {
                option.addEventListener('click', () => {
                    filterOptions.forEach(o => o.classList.remove('selected'));
                    option.classList.add('selected');
                    selectedFilter = option.getAttribute('data-filter');
                });
            });
            
            // Select traits
            traitItems.forEach(item => {
                item.addEventListener('click', () => {
                    const trait = item.getAttribute('data-trait');
                    const weight = parseInt(item.getAttribute('data-weight'));
                    
                    if (selectedTraits.some(t => t.trait === trait)) {
                        // Deselect trait
                        selectedTraits = selectedTraits.filter(t => t.trait !== trait);
                        item.classList.remove('selected');
                    } else {
                        // Select trait
                        if (selectedTraits.length < 10) {
                            selectedTraits.push({ trait, weight });
                            item.classList.add('selected');
                        } else {
                            alert('You can select up to 10 traits per category.');
                        }
                    }
                });
            });
            
            // Find match
            findMatchBtn.addEventListener('click', async () => {
                if (selectedTraits.length === 0) {
                    alert('Please select at least one trait to find your match.');
                    return;
                }
                
                // Get slider values
                const introExtroValue = parseInt(document.getElementById('introExtroSlider').value);
                const logicCreativeValue = parseInt(document.getElementById('logicCreativeSlider').value);
                const reservedExpressiveValue = parseInt(document.getElementById('reservedExpressiveSlider').value);
                const spontaneousOrganizedValue = parseInt(document.getElementById('spontaneousOrganizedSlider').value);
                const practicalDreamerValue = parseInt(document.getElementById('practicalDreamerSlider').value);
                
                // Show loading state
                resultContainer.innerHTML = `
                    <div class="loading">
                        <i class="fas fa-spinner fa-spin" style="font-size: 3rem; color: #6a5acd;"></i>
                        <p>Analyzing your personality and finding your best Disney match...</p>
                        <div class="progress-bar">
                            <div class="progress" id="fetchProgress"></div>
                        </div>
                    </div>
                `;
                resultContainer.style.display = 'block';
                
                // Scroll to results
                resultContainer.scrollIntoView({ behavior: 'smooth' });
                
                try {
                    // Find the best matches
                    const matches = findBestMatches(
                        selectedTraits, 
                        allCharacters,
                        introExtroValue,
                        logicCreativeValue,
                        reservedExpressiveValue,
                        spontaneousOrganizedValue,
                        practicalDreamerValue
                    );
                    
                    // Display results
                    displayResults(matches, selectedTraits);
                } catch (error) {
                    console.error('Error finding match:', error);
                    resultContainer.innerHTML = `
                        <p>Sorry, we encountered an error while finding your match. Please try again.</p>
                        <button onclick="window.location.reload()">Try Again</button>
                    `;
                }
            });
            
            // Reset selection
            resetBtn.addEventListener('click', () => {
                selectedTraits = [];
                traitItems.forEach(item => {
                    item.classList.remove('selected');
                });
                
                // Reset sliders
                document.getElementById('introExtroSlider').value = 5;
                document.getElementById('logicCreativeSlider').value = 5;
                document.getElementById('reservedExpressiveSlider').value = 5;
                document.getElementById('spontaneousOrganizedSlider').value = 5;
                document.getElementById('practicalDreamerSlider').value = 5;
                
                // Reset filter
                filterOptions.forEach(o => o.classList.remove('selected'));
                document.querySelector('[data-filter="all"]').classList.add('selected');
                selectedFilter = 'all';
                
                resultContainer.style.display = 'none';
            });
            
            // Initialize the application
            async function initApp() {
                try {
                    // First, try to get total pages from API
                    const infoResponse = await fetch('https://api.disneyapi.dev/character');
                    if (infoResponse.ok) {
                        const infoData = await infoResponse.json();
                        totalPages = infoData.info.totalPages;
                        apiInfo.innerHTML = `<i class="fas fa-info-circle"></i> Loading characters from Disney API (${totalPages} pages)...`;
                    }
                    
                    // Fetch all characters from the API with pagination
                    await fetchAllCharacters();
                    
                    apiInfo.innerHTML = `<i class="fas fa-check-circle" style="color: green;"></i> Loaded ${allCharacters.length} characters from Disney API`;
                } catch (error) {
                    console.error('Error initializing app:', error);
                    apiInfo.innerHTML = `<i class="fas fa-exclamation-triangle" style="color: orange;"></i> Using fallback data (API unavailable)`;
                    allCharacters = getFallbackCharacters();
                }
            }
            
            // Fetch all characters from the Disney API with pagination
            async function fetchAllCharacters() {
                // If we already have characters, don't fetch again
                if (allCharacters.length > 0 || isFetching) return;
                
                isFetching = true;
                let page = 1;
                let hasMore = true;
                
                try {
                    while (hasMore && page <= 20) { // Limit to 20 pages to avoid too many requests
                        // Check cache first
                        if (characterCache.has(page)) {
                            const cachedData = characterCache.get(page);
                            allCharacters = allCharacters.concat(cachedData);
                            page++;
                            continue;
                        }
                        
                        // Update progress
                        apiInfo.innerHTML = `<i class="fas fa-spinner fa-spin"></i> Loading page ${page}/${totalPages || '?'} from Disney API...`;
                        
                        // Fetch page
                        const response = await fetch(`https://api.disneyapi.dev/character?page=${page}&pageSize=${charactersPerPage}`);
                        
                        if (!response.ok) {
                            throw new Error(`API returned ${response.status} for page ${page}`);
                        }
                        
                        const data = await response.json();
                        
                        if (data.data && data.data.length > 0) {
                            // Filter characters with images and extract traits
                            const validCharacters = data.data
                                .filter(char => char.imageUrl && (char.films && char.films.length > 0) || (char.tvShows && char.tvShows.length > 0))
                                .map(char => ({
                                    ...char,
                                    traits: extractTraitsFromCharacter(char),
                                    characterType: determineCharacterType(char)
                                }));
                            
                            allCharacters = allCharacters.concat(validCharacters);
                            
                            // Cache this page
                            characterCache.set(page, validCharacters);
                            
                            page++;
                            
                            // Check if we have more pages
                            if (!data.info || !data.info.nextPage) {
                                hasMore = false;
                            }
                        } else {
                            hasMore = false;
                        }
                        
                        // Small delay to be respectful to the API
                        await new Promise(resolve => setTimeout(resolve, 100));
                    }
                } catch (error) {
                    console.error('Error fetching characters from API:', error);
                    // If we have some characters, keep them, otherwise use fallback
                    if (allCharacters.length === 0) {
                        allCharacters = getFallbackCharacters();
                    }
                } finally {
                    isFetching = false;
                }
            }
            
            // Determine character type based on films and other attributes
            function determineCharacterType(character) {
                const name = character.name.toLowerCase();
                const films = character.films ? character.films.join(' ').toLowerCase() : '';
                const tvShows = character.tvShows ? character.tvShows.join(' ').toLowerCase() : '';
                
                if (name.includes('queen') || name.includes('king') || name.includes('prince') || name.includes('princess') || 
                    films.includes('princess') || tvShows.includes('princess')) {
                    return 'princess';
                } else if (films.includes('villain') || name.includes('evil') || name.includes('maleficent') || 
                           name.includes('ursula') || name.includes('jafar') || name.includes('cruella') || 
                           name.includes('scar') || name.includes('hades')) {
                    return 'villain';
                } else if (films.includes('hero') || films.includes('save') || films.includes('rescue') || 
                          name.includes('hero') || tvShows.includes('hero')) {
                    return 'hero';
                } else if (character.imageUrl.includes('animal') || name.includes('bear') || name.includes('lion') || 
                          name.includes('dog') || name.includes('cat') || name.includes('tiger') || 
                          name.includes('dory') || name.includes('nemo') || name.includes('marlin') ||
                          name.includes('simba') || name.includes('mufasa') || name.includes('piglet') ||
                          name.includes('tigger') || name.includes('eeyore') || name.includes('pooh')) {
                    return 'animal';
                }
                
                return 'other';
            }
            
            // Extract traits from character data based on films, TV shows, etc.
            function extractTraitsFromCharacter(character) {
                // First check if we have predefined traits for this character
                if (characterTraitMapping[character.name]) {
                    return characterTraitMapping[character.name];
                }
                
                const traits = [];
                const sourceText = [
                    ...(character.films || []),
                    ...(character.tvShows || []),
                    character.name,
                    character._id || ''
                ].join(' ').toLowerCase();
                
                // Define trait keywords with weights
                const traitKeywords = {
                    brave: ['brave', 'courage', 'hero', 'warrior', 'fight', 'battle', 'risk'],
                    kind: ['kind', 'gentle', 'care', 'help', 'compassion', 'friend', 'sweet'],
                    adventurous: ['adventure', 'explore', 'journey', 'quest', 'travel', 'venture'],
                    funny: ['funny', 'joke', 'comedy', 'humor', 'laugh', 'silly', 'wit'],
                    loyal: ['loyal', 'faithful', 'devot', 'true', 'trust', 'allegiance'],
                    clever: ['clever', 'smart', 'intelligent', 'wise', 'brilliant', 'shrewd'],
                    curious: ['curious', 'inquisi', 'explore', 'discover', 'question', 'nosy'],
                    determined: ['determin', 'persist', 'persever', 'tenaci', 'strong', 'resolute'],
                    optimistic: ['optimis', 'hope', 'positive', 'joy', 'happy', 'cheer'],
                    compassionate: ['compassion', 'empathetic', 'caring', 'kindness', 'sympathy', 'mercy'],
                    wise: ['wise', 'wisdom', 'sage', 'knowledgeable', 'insightful'],
                    creative: ['creative', 'artistic', 'imaginative', 'inventive', 'original'],
                    friendship: ['friend', 'companion', 'buddy', 'pal', 'mates'],
                    family: ['family', 'parent', 'mother', 'father', 'sister', 'brother'],
                    freedom: ['free', 'freedom', 'liberty', 'independent', 'autonomy'],
                    justice: ['justice', 'fair', 'righteous', 'equality', 'rights'],
                    knowledge: ['knowledge', 'learn', 'study', 'educated', 'smart'],
                    honesty: ['honest', 'truth', 'sincere', 'genuine', 'authentic'],
                    energetic: ['energy', 'active', 'lively', 'vibrant', 'dynamic'],
                    patient: ['patient', 'calm', 'tolerant', 'enduring'],
                    confident: ['confident', 'self-assured', 'bold', 'assertive'],
                    humble: ['humble', 'modest', 'unassuming', 'meek'],
                    leadership: ['leader', 'command', 'authority', 'direct'],
                    dreamer: ['dream', 'imaginative', 'visionary', 'idealist'],
                    spiritual: ['spirit', 'soul', 'faith', 'belief'],
                    protective: ['protect', 'guard', 'defend', 'shield'],
                    mischievous: ['mischief', 'playful', 'naughty', 'trouble'],
                    resilient: ['resilient', 'tough', 'strong', 'endurance'],
                    innovative: ['innovate', 'create', 'invent', 'original']
                };
                
                // Check for each trait
                for (const [trait, keywords] of Object.entries(traitKeywords)) {
                    for (const keyword of keywords) {
                        if (sourceText.includes(keyword)) {
                            traits.push(trait);
                            break;
                        }
                    }
                }
                
                return [...new Set(traits)]; // Remove duplicates
            }
            
            // Find best matches based on selected traits and filters
            function findBestMatches(selectedTraits, characters, introExtroValue, logicCreativeValue, reservedExpressiveValue, spontaneousOrganizedValue, practicalDreamerValue) {
                // Apply filter
                let filteredCharacters = characters;
                if (selectedFilter !== 'all') {
                    filteredCharacters = characters.filter(char => 
                        char.characterType === selectedFilter
                    );
                }
                
                const scoredCharacters = filteredCharacters.map(character => {
                    const characterTraits = character.traits || [];
                    
                    // Calculate weighted match score
                    let score = 0;
                    let maxPossibleScore = 0;
                    
                    selectedTraits.forEach(({ trait, weight }) => {
                        maxPossibleScore += weight;
                        if (characterTraits.includes(trait)) {
                            score += weight;
                        }
                    });
                    
                    // Calculate behavior compatibility (simplified)
                    const behaviorScore = calculateBehaviorScore(
                        character, 
                        introExtroValue, 
                        logicCreativeValue, 
                        reservedExpressiveValue,
                        spontaneousOrganizedValue,
                        practicalDreamerValue
                    );
                    
                    // Combine trait score (70%) with behavior score (30%)
                    const normalizedTraitScore = maxPossibleScore > 0 ? (score / maxPossibleScore) * 70 : 0;
                    const finalScore = Math.round(normalizedTraitScore + (behaviorScore * 30));
                    
                    const matchingTraits = characterTraits.filter(trait => 
                        selectedTraits.some(t => t.trait === trait)
                    );
                    
                    return {
                        ...character,
                        matchScore: finalScore,
                        matchingTraits
                    };
                });
                
                // Sort by score (descending) and return top 10
                return scoredCharacters
                    .filter(char => char.matchScore > 0)
                    .sort((a, b) => b.matchScore - a.matchScore)
                    .slice(0, 10);
            }
            
            // Calculate behavior compatibility score
            function calculateBehaviorScore(character, introExtroValue, logicCreativeValue, reservedExpressiveValue, spontaneousOrganizedValue, practicalDreamerValue) {
                // Simplified behavior scoring based on character traits
                let behaviorScore = 0;
                
                // Introvert/Extrovert dimension
                if (character.traits.includes('funny') || character.traits.includes('expressive') || character.traits.includes('energetic')) {
                    behaviorScore += (introExtroValue / 10) * 0.25;
                } else if (character.traits.includes('reserved') || character.traits.includes('shy') || character.traits.includes('introverted')) {
                    behaviorScore += ((10 - introExtroValue) / 10) * 0.25;
                } else {
                    behaviorScore += 0.125; // Neutral
                }
                
                // Logical/Creative dimension
                if (character.traits.includes('creative') || character.traits.includes('artistic') || character.traits.includes('dreamer')) {
                    behaviorScore += (logicCreativeValue / 10) * 0.2;
                } else if (character.traits.includes('logical') || character.traits.includes('analytical') || character.traits.includes('practical')) {
                    behaviorScore += ((10 - logicCreativeValue) / 10) * 0.2;
                } else {
                    behaviorScore += 0.1; // Neutral
                }
                
                // Reserved/Expressive dimension
                if (character.traits.includes('expressive') || character.traits.includes('outgoing') || character.traits.includes('energetic')) {
                    behaviorScore += (reservedExpressiveValue / 10) * 0.2;
                } else if (character.traits.includes('reserved') || character.traits.includes('quiet') || character.traits.includes('shy')) {
                    behaviorScore += ((10 - reservedExpressiveValue) / 10) * 0.2;
                } else {
                    behaviorScore += 0.1; // Neutral
                }
                
                // Spontaneous/Organized dimension
                if (character.traits.includes('spontaneous') || character.traits.includes('adventurous') || character.traits.includes('energetic')) {
                    behaviorScore += (spontaneousOrganizedValue / 10) * 0.2;
                } else if (character.traits.includes('organized') || character.traits.includes('determined') || character.traits.includes('focused')) {
                    behaviorScore += ((10 - spontaneousOrganizedValue) / 10) * 0.2;
                } else {
                    behaviorScore += 0.1; // Neutral
                }
                
                // Practical/Dreamer dimension
                if (character.traits.includes('dreamer') || character.traits.includes('creative') || character.traits.includes('imaginative')) {
                    behaviorScore += (practicalDreamerValue / 10) * 0.15;
                } else if (character.traits.includes('practical') || character.traits.includes('logical') || character.traits.includes('analytical')) {
                    behaviorScore += ((10 - practicalDreamerValue) / 10) * 0.15;
                } else {
                    behaviorScore += 0.075; // Neutral
                }
                
                return behaviorScore;
            }
            
            // Display the results
            function displayResults(matches, selectedTraits) {
                if (matches.length === 0) {
                    resultContainer.innerHTML = `
                        <h2>No Matches Found</h2>
                        <p>We couldn't find any Disney characters that match your selected traits and filters.</p>
                        <p>Try selecting different traits or changing your filter settings.</p>
                        <button onclick="window.location.reload()">Try Again</button>
                    `;
                    return;
                }
                
                const topMatch = matches[0];
                
                resultContainer.innerHTML = `
                    <h2>Your Disney Match!</h2>
                    <div class="character-card">
                        <img src="${topMatch.imageUrl}" alt="${topMatch.name}" class="character-image" onerror="this.src='https://static.wikia.nocookie.net/disney/images/9/96/Simba_%28grown_up%29.png'">
                        <div class="character-info">
                            <h2>${topMatch.name}</h2>
                            <p>${topMatch.films && topMatch.films[0] ? `Featured in: ${topMatch.films[0]}` : 'Disney Character'}</p>
                            ${topMatch.tvShows && topMatch.tvShows.length > 0 ? `<p>TV Shows: ${topMatch.tvShows.slice(0, 2).join(', ')}</p>` : ''}
                            <div class="traits-list">
                                ${topMatch.matchingTraits.map(trait => `
                                    <div class="trait-pill">${trait}</div>
                                `).join('')}
                            </div>
                        </div>
                    </div>
                    <div class="match-percentage">
                        ${topMatch.matchScore}% Match with Your Personality
                    </div>
                    
                    <h3>Other Great Matches</h3>
                    <div class="top-matches">
                        ${matches.slice(1, 5).map(character => `
                            <div class="match-card">
                                <img src="${character.imageUrl}" alt="${character.name}" class="match-image" onerror="this.src='https://static.wikia.nocookie.net/disney/images/9/96/Simba_%28grown_up%29.png'">
                                <div class="match-info">
                                    <h3>${character.name}</h3>
                                    <p>${character.films && character.films[0] ? character.films[0] : 'Disney Character'}</p>
                                    <div class="traits-list">
                                        ${character.matchingTraits.slice(0, 3).map(trait => `
                                            <div class="trait-pill">${trait}</div>
                                        `).join('')}
                                    </div>
                                    <div class="match-score">${character.matchScore}% Match</div>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                    
                    <div class="buttons">
                        <button onclick="window.location.reload()">Try Again</button>
                        <button id="loadMoreBtn">Load More Characters</button>
                    </div>
                `;
                
                // Add event listener for the Load More button
                document.getElementById('loadMoreBtn').addEventListener('click', async () => {
                    await fetchAllCharacters();
                    resultContainer.innerHTML = `
                        <div class="loading">
                            <i class="fas fa-spinner fa-spin" style="font-size: 3rem; color: #6a5acd;"></i>
                            <p>Loaded more characters. Analyzing your personality again...</p>
                        </div>
                    `;
                    
                    // Recalculate matches with the expanded character set
                    const introExtroValue = parseInt(document.getElementById('introExtroSlider').value);
                    const logicCreativeValue = parseInt(document.getElementById('logicCreativeSlider').value);
                    const reservedExpressiveValue = parseInt(document.getElementById('reservedExpressiveSlider').value);
                    const spontaneousOrganizedValue = parseInt(document.getElementById('spontaneousOrganizedSlider').value);
                    const practicalDreamerValue = parseInt(document.getElementById('practicalDreamerSlider').value);
                    
                    const newMatches = findBestMatches(
                        selectedTraits, 
                        allCharacters,
                        introExtroValue,
                        logicCreativeValue,
                        reservedExpressiveValue,
                        spontaneousOrganizedValue,
                        practicalDreamerValue
                    );
                    
                    displayResults(newMatches, selectedTraits);
                });
            }
            
            // Fallback character data in case API fails
            function getFallbackCharacters() {
                return [
                    {
                        name: "Simba",
                        imageUrl: "https://static.wikia.nocookie.net/disney/images/9/96/Simba_%28grown_up%29.png",
                        films: ["The Lion King", "The Lion King II: Simba's Pride"],
                        tvShows: ["The Lion Guard"],
                        traits: ["brave", "adventurous", "loyal", "determined", "family", "leadership"],
                        characterType: "hero"
                    },
                    {
                        name: "Ariel",
                        imageUrl: "https://static.wikia.nocookie.net/disney/images/7/77/Ariel_disney.png",
                        films: ["The Little Mermaid", "The Little Mermaid II: Return to the Sea"],
                        traits: ["curious", "adventurous", "determined", "kind", "family", "dreamer"],
                        characterType: "princess"
                    },
                    {
                        name: "Mickey Mouse",
                        imageUrl: "https://static.wikia.nocookie.net/disney/images/e/e9/Mickey_Mouse_Disney_3.png",
                        films: ["Fantasia", "Mickey's Once Upon a Christmas"],
                        tvShows: ["Mickey Mouse Clubhouse", "The Mickey Mouse Club"],
                        traits: ["optimistic", "funny", "brave", "kind", "friendship", "energetic"],
                        characterType: "hero"
                    },
                    {
                        name: "Elsa",
                        imageUrl: "https://static.wikia.nocookie.net/disney/images/9/9a/Elsa.png",
                        films: ["Frozen", "Frozen II"],
                        traits: ["compassionate", "determined", "brave", "kind", "family", "creative", "introverted"],
                        characterType: "princess"
                    },
                    {
                        name: "Genie",
                        imageUrl: "https://static.wikia.nocookie.net/disneyimages/3/3f/Genie.png",
                        films: ["Aladdin", "The Return of Jafar"],
                        traits: ["funny", "kind", "compassionate", "optimistic", "friendship", "creative", "extroverted"],
                        characterType: "hero"
                    },
                    {
                        name: "Moana",
                        imageUrl: "https://static.wikia.nocookie.net/disney/images/2/26/Moana_Disney.png",
                        films: ["Moana"],
                        traits: ["brave", "determined", "adventurous", "compassionate", "family", "spiritual"],
                        characterType: "princess"
                    },
                    {
                        name: "Woody",
                        imageUrl: "https://static.wikia.nocookie.net/disney/images/5/59/Woody.png",
                        films: ["Toy Story", "Toy Story 2", "Toy Story 3"],
                        traits: ["loyal", "brave", "kind", "determined", "friendship", "leadership"],
                        characterType: "hero"
                    },
                    {
                        name: "Rapunzel",
                        imageUrl: "https://static.wikia.nocookie.net/disney/images/5/51/Rapunzel_disney.png",
                        films: ["Tangled", "Tangled Ever After"],
                        traits: ["curious", "optimistic", "brave", "kind", "adventurous", "creative", "dreamer"],
                        characterType: "princess"
                    },
                    {
                        name: "Mufasa",
                        imageUrl: "https://static.wikia.nocookie.net/disney/images/4/4d/Mufasa.png",
                        films: ["The Lion King"],
                        traits: ["wise", "brave", "kind", "compassionate", "family", "leadership"],
                        characterType: "hero"
                    },
                    {
                        name: "Ursula",
                        imageUrl: "https://static.wikia.nocookie.net/disney/images/2/29/Ursula_disney.png",
                        films: ["The Little Mermaid"],
                        traits: ["clever", "determined", "creative", "ambitious", "powerful"],
                        characterType: "villain"
                    },
                    {
                        name: "Cinderella",
                        imageUrl: "https://static.wikia.nocookie.net/disney/images/9/9e/Cinderella_%28character%29.png",
                        films: ["Cinderella", "Cinderella II", "Cinderella III"],
                        traits: ["kind", "optimistic", "compassionate", "determined", "patient", "humble"],
                        characterType: "princess"
                    },
                    {
                        name: "Belle",
                        imageUrl: "https://static.wikia.nocookie.net/disney/images/7/7c/Belle_%28beauty_and_the_beast%29.png",
                        films: ["Beauty and the Beast", "Beauty and the Beast: The Enchanted Christmas"],
                        traits: ["kind", "curious", "brave", "compassionate", "knowledge", "dreamer"],
                        characterType: "princess"
                    }
                ];
            }
        });
