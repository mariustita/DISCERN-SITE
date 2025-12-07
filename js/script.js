document.addEventListener('DOMContentLoaded', () => {

    // --- Active Navigation Link Highlighting (Multi-Page) ---
    function highlightActiveNavLink() {
        const navLinks = document.querySelectorAll('header nav ul li a'); // Select all nav links
        // Get current page filename (safer than full path if deploying in subfolders)
        const currentPage = window.location.pathname.substring(window.location.pathname.lastIndexOf('/') + 1) || 'index.html'; // Default to index.html if path is '/'
        const currentHash = window.location.hash; // Get the hash fragment (e.g., '#about')

        navLinks.forEach(link => {
            link.classList.remove('active'); // Remove active class from all links first

            // Get page name and hash from the link's href
            let linkPath = link.getAttribute('href');
            let linkPage = '';
            let linkHash = '';

            // Separate path and hash
            const hashIndex = linkPath.indexOf('#');
            if (hashIndex !== -1) {
                linkHash = linkPath.substring(hashIndex);
                linkPath = linkPath.substring(0, hashIndex);
            }
            // Handle cases where linkPath might be empty (like href="#about")
            if (linkPath) {
                linkPage = linkPath.substring(linkPath.lastIndexOf('/') + 1) || 'index.html';
            } else {
                // If no path, assume it's for the current page (likely index.html for hash links)
                linkPage = currentPage;
            }


            // Determine if the link should be active
            let isActive = false;

            // Case 1: Link points to the current page (filename match)
            if (linkPage === currentPage) {
                // Subcase 1a: We are on index.html
                if (currentPage === 'index.html') {
                    // Activate if link hash matches current hash OR if both are empty/no hash on index
                    if ((currentHash && linkHash === currentHash) || (!currentHash && !linkHash && (linkPage === 'index.html' || linkPath === ''))) {
                        // The second condition ensures only the 'Home' link is active when at the top of index.html
                        // And handles href="index.html"
                        isActive = true;
                    }
                } else {
                    // Subcase 1b: We are on another page (e.g., articles.html) - activate if it's the main link (no hash)
                    if (!linkHash) { // Only activate the main page link
                        isActive = true;
                    }
                }
            }

            // Case 2: Special case for highlighting "Articles" nav item when on an individual article page
            if (currentPage.startsWith('article-') && linkPage === 'articles.html' && !linkHash) {
                isActive = true;
            }

            if (isActive) {
                link.classList.add('active');
            }
        });
    }

    // Run the highlighting function on page load
    highlightActiveNavLink();

    // Add event listener to update hash highlighting on the index page only
    // Check if the current page is index.html or the root path
    if (window.location.pathname === '/' || window.location.pathname.endsWith('index.html')) {
        window.addEventListener('hashchange', highlightActiveNavLink, { passive: true });
    }


    // --- REVERTED Mobile Menu Toggle ---
    const menuToggleBtn = document.getElementById('menu-toggle');
    // Select the UL that contains the main navigation links
    // Assumes only one primary UL in the nav for simplicity now
    const navList = document.querySelector('header nav > ul'); // Target direct UL child of nav

    if (menuToggleBtn && navList) {
        menuToggleBtn.addEventListener('click', () => {
            // Toggle the 'mobile-active' class directly on the UL
            navList.classList.toggle('mobile-active');

            // Toggle the aria-expanded attribute for accessibility
            const isExpanded = navList.classList.contains('mobile-active');
            menuToggleBtn.setAttribute('aria-expanded', isExpanded);

            // Optional: Change button icon (bars <-> times)
            const icon = menuToggleBtn.querySelector('i');
            if (icon) {
                if (isExpanded) {
                    icon.classList.remove('fa-bars');
                    icon.classList.add('fa-times');
                } else {
                    icon.classList.remove('fa-times');
                    icon.classList.add('fa-bars');
                }
            }
        });

        // Optional: Close menu if a link inside it is clicked
        navList.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                // Only close if the menu is actually open and visible (mobile state)
                if (navList.classList.contains('mobile-active')) {
                    navList.classList.remove('mobile-active');
                    menuToggleBtn.setAttribute('aria-expanded', 'false');
                    // Reset icon
                    const icon = menuToggleBtn.querySelector('i');
                    if (icon) {
                        icon.classList.remove('fa-times');
                        icon.classList.add('fa-bars');
                    }
                }
            });
        });
    } else {
        if (!menuToggleBtn) console.error("Menu toggle button (#menu-toggle) not found!");
        if (!navList) console.error("Navigation list (header nav > ul) not found!"); // Adjusted selector in error message
    }
    // --- END REVERTED Mobile Menu Toggle ---


    // --- Contact Form Handling (Simulation - Only relevant on index.html) ---
    const contactForm = document.getElementById('contact-form');
    const formStatus = document.getElementById('form-status');

    if (contactForm && formStatus) { // Check prevents errors on pages without the form
        contactForm.addEventListener('submit', (event) => {
            event.preventDefault();
            // Reset status styles immediately
            formStatus.innerHTML = '';
            formStatus.className = 'form-status'; // Reset class list
            formStatus.style.display = 'none';

            const nameInput = document.getElementById('name');
            const emailInput = document.getElementById('email');
            const phoneInput = document.getElementById('phone'); // Get phone input
            const messageInput = document.getElementById('message');

            // Basic Frontend Validation
            let isValid = true;
            // Clear previous invalid states
            [nameInput, emailInput, messageInput].forEach(el => el.classList.remove('invalid'));

            if (!nameInput.value.trim()) {
                isValid = false;
                nameInput.classList.add('invalid'); // Add visual feedback
            }
            if (!emailInput.value.trim() || !/^\S+@\S+\.\S+$/.test(emailInput.value)) {
                isValid = false;
                emailInput.classList.add('invalid');
            }
            // Phone is optional, so no validation here unless required field
            if (!messageInput.value.trim()) {
                isValid = false;
                messageInput.classList.add('invalid');
            }

            if (!isValid) {
                // Use translation for error message
                formStatus.textContent = translations[currentLang]?.form_fill_all || 'Please fill out all required fields correctly.';
                formStatus.classList.add('error');
                formStatus.style.display = 'block';
                return; // Stop submission
            }

            // Show sending status
            formStatus.textContent = translations[currentLang]?.form_sending || 'Sending...';
            formStatus.style.display = 'block'; // Show status div
            formStatus.classList.remove('success', 'error'); // Ensure no old status classes

            // Simulate network delay
            setTimeout(() => {
                // --- Simulate Success ---
                formStatus.textContent = translations[currentLang]?.form_success || 'Message sent successfully! We will get back to you soon.';
                formStatus.classList.add('success');
                // Clear invalid markers
                [nameInput, emailInput, messageInput, phoneInput].forEach(el => el?.classList.remove('invalid')); // Clear phone too if validated
                contactForm.reset(); // Clear the form fields

                // --- Hide status after a few seconds ---
                setTimeout(() => {
                    formStatus.style.display = 'none';
                    formStatus.className = 'form-status'; // Reset class
                }, 5000); // 5 seconds

            }, 1500); // 1.5 seconds delay
        });
    }


    // --- Language Switching ---
    const langSwitches = document.querySelectorAll('.lang-switch'); // Selects ALL switches
    let currentLang = 'en'; // Default language
    try {
        const preferredLang = localStorage.getItem('preferredLang');
        if (preferredLang && (preferredLang === 'en' || preferredLang === 'ro')) { // Check if stored lang is valid
            currentLang = preferredLang;
        } else {
            // Fallback to HTML lang attribute if no valid preference stored
            currentLang = document.documentElement.lang || 'en';
        }
    } catch (e) {
        console.warn("Could not access localStorage for language preference.", e);
        // Fallback to HTML lang attribute if localStorage access fails
        currentLang = document.documentElement.lang || 'en';
    }

    const translations = {
        en: {
            site_title: "DISCERN - Welcome",
            business_name: "DISCERN",
            nav_home: "Home",
            nav_about: "About",
            nav_services: "Services",
            nav_articles: "Articles",
            nav_contact: "Contact",
            nav_location: "Location",
            hero_title: "DISCERN",
            hero_subtitle: "TRANSFORMS OPERATIONAL CHAOS INTO PREDICTABLE PROFIT",
            hero_cta: "Get In Touch",
            about_title: "About Us",
            about_text: "In the fast-paced world, effective delivery management is the key to staying ahead of the competition. Our approach combines agility, optimization and advanced technology integration to ensure seamless deliveries and maximum efficiency. By partnering with us, you'll experience streamlined operations, delighted customers and a distinct edge in the market. Let's elevate your delivery strategy and drive your business to new heights of success together.",
            services_title: "Our Services",
            service1_title: "Operational Architecture & Profit Optimization",
            service1_desc: "Strategic expertise to businesses struggling with complexity. Focus on resolving operational chaos, establishing rigorous process architecture and optimizing workflows to guarantee predictable profit margins.",
            service2_title: "High-Impact Automation & Digital Transformation",
            service2_desc: "Design and develop digital solutions engineered for efficiency. Leverage on automation to eliminate unnecessary labor, increase team efficiency and reduce operational risk.",
            service3_title: "Predictable Project Recovery & Delivery",
            service3_desc: "A structured project management approach specialized in recovering complex projects and ensuring on-time and on-budget delivery. Implement rigorous scope control and continuous alignment to mitigate projects drift.",
            contact_title: "Contact Us",
            contact_prompt: "Have questions? Want to discuss a project? Send us a message!",
            form_name: "Name:",
            form_email: "Email:",
            form_phone: "Phone:",
            form_message: "Message:",
            form_send: "Send Message",
            form_sending: "Sending...",
            form_success: "Message sent successfully! We will get back to you soon.",
            form_error: "An error occurred. Please try again.",
            form_fill_all: "Please fill out all required fields correctly.",
            location_title: "Our Location",
            location_hours: "Hours:",
            footer_text: "© 2026 DISCERN. All Rights Reserved.",
            popup_phone_title: "Our Contact Number:",
            articles_page_title: "Articles - DISCERN",
            articles_title: "Latest Articles",
            back_to_articles: "\u2190 Back to Articles",

            // Article 1
            article1_title: "Quantum Computing: A Journey Towards Unimaginable Achievements",
            article1_summary_short: "For decades, the idea of quantum computing existed only in the minds of theorists and physicists who dared to dream. The field began as a wild thought experiment, exploring what could happen if the enigmatic rules of quantum mechanics were harnessed for computation...",
            article1_full_title: "Quantum Computing: A Journey Towards Unimaginable Achievements - DISCERN",
            article1_full_text: `<p>For decades, the idea of quantum computing existed only in the minds of theorists and physicists who dared to dream. The field began as a wild thought experiment, exploring what could happen if the enigmatic rules of quantum mechanics were harnessed for computation. Unlike classical computers, limited to processing information in binary, zeros and ones, quantum computers promised something far more extraordinary. Their qubits, operating in a superposition of states, could perform calculations across multiple possibilities simultaneously, offering exponential leaps in computational power.</p>
                <p>The journey from theory to tangible achievements has been arduous but breathtaking. One of the earliest breakthroughs came when scientists built functional quantum circuits, the building blocks of computation. Though primitive by today’s standards, these circuits demonstrated that qubits could be manipulated and measured, proving the feasibility of quantum computation.</p>
                <p>In 2019, Google made headlines with what it called "quantum supremacy." Using its 53-qubit quantum processor, Sycamore, Google successfully performed a calculation in 200 seconds that would take the world’s most powerful supercomputer thousands of years to complete. The experiment didn’t solve a real-world problem, but it showcased the sheer potential of quantum computing, marking a historic milestone in the field.</p>
                <p>Another remarkable achievement lies in quantum cryptography and the quest for unbreakable security. By leveraging the principles of quantum entanglement, researchers have developed systems where data is transmitted with absolute confidentiality. If anyone attempts to interfere with these transmissions, the very act of observation disrupts the quantum state, making the intrusion immediately detectable. This technology is already being tested for secure communications in sectors like finance and defense.</p>
                <p>Quantum computing has also started unraveling the mysteries of nature itself. Chemistry and materials science are fields notorious for their computational challenges. Modeling the behavior of molecules or designing new compounds is beyond the reach of classical supercomputers due to the vast number of variables involved. In 2020, IBM’s quantum team simulated the behavior of a small molecule, paving the way for breakthroughs in drug discovery, renewable energy and even the development of superconductors.</p>
                <p>Perhaps one of the most inspiring stories comes from optimization problems, those daunting puzzles that require finding the best solution among countless possibilities. From supply chain logistics to financial portfolio management, quantum algorithms have shown immense promise in tackling such problems. Airlines could optimize flight paths, reducing delays and fuel consumption, while financial institutions could develop strategies that minimize risks with greater precision than ever before.</p>
                <p>But the road to quantum computing's current achievements wasn’t without its hurdles. Qubits, the stars of the quantum show, are notoriously unstable. They are sensitive to even the tiniest environmental disturbances, a stray photon or a whisper of heat can disrupt their state. Yet, through years of innovation, scientists have found ways to extend their coherence times and reduce errors. Sophisticated cooling systems, operating at temperatures colder than outer space, have become standard in the quantum labs of giants like IBM, Google and Rigetti Computing.</p>
                <p>As these achievements pile up, quantum computing continues to spark excitement and curiosity. Governments are investing billions into quantum research, while private companies race to build the first large-scale, fault-tolerant quantum computer. The potential applications seem endless: solving climate change through better modeling of weather systems, revolutionizing artificial intelligence by accelerating machine learning, and unlocking new levels of efficiency in everything from transportation to healthcare.</p>
                <p>Yet, the most remarkable achievement of quantum computing might not be a specific calculation or application. It’s the paradigm shift it represents. Quantum computing challenges humanity to think differently, to embrace a world where the impossible becomes possible. It reminds us that the universe operates on rules that are as mysterious as they are beautiful and that understanding those rules can unlock extraordinary capabilities.</p>
                <p>In the decades to come, quantum computing will undoubtedly achieve facts that today seem unimaginable. But for now, it stands as a testament to human ingenuity, a beacon of what we can accomplish when curiosity meets perseverance. The quantum revolution has begun, and its achievements are only just unfolding.</p>`,

            // Article 2
            article2_title: "Understanding Project Management: The Key to bring your business at next level",
            article2_summary_short: "Project management is a systematic approach to planning, organizing, executing, and monitoring tasks and resources to achieve specific goals within a defined timeframe and budget. It is a critical discipline that ensures projects are completed efficiently, on time, and within scope...",
            article2_full_title: "Understanding Project Management: The Key to bring your business at next level - DISCERN",
            article2_full_text: `<p>Project management is a systematic approach to planning, organizing, executing, and monitoring tasks and resources to achieve specific goals within a defined timeframe and budget. It is a critical discipline that ensures projects are completed efficiently, on time, and within scope.</p>
                <p>At its core, project management involves the strategic alignment of resources, including people, time, and finances, to deliver tangible results that meet stakeholders' expectations. It encompasses a wide range of activities, from defining project objectives and creating work breakdown structures to scheduling tasks, managing risks, and communicating progress.</p>
                <p>One of the fundamental principles of project management is the establishment of clear goals and objectives. These provide a roadmap for the project team, guiding their efforts and helping them stay focused on the desired outcomes. Effective project managers excel at setting realistic expectations, balancing competing priorities, and adapting to changes as they arise.</p>
                <p>Communication is another key aspect of project management. Clear and frequent communication helps ensure that everyone involved in the project understands their roles and responsibilities, as well as any changes to the project scope or timeline. It fosters collaboration, minimizes misunderstandings, and promotes a culture of accountability and transparency.</p>
                <p>Successful project management requires a combination of technical skills, such as budgeting and scheduling, as well as interpersonal skills, such as leadership and conflict resolution. By leveraging proven methodologies and best practices, project managers can navigate complex challenges and deliver results that drive organizational success.</p>
                <p>Ultimately, effective project management is essential for achieving strategic objectives, optimizing resources, and maintaining a competitive edge in today's fast-paced business environment.</p>`,

            // Article 3
            article3_title: "Agile Delivery: A Narrative Exploration of Modern Project Management",
            article3_summary_short: "In the fast-paced realm of contemporary project management, where adaptability and responsiveness are paramount, Agile Delivery emerges as a guiding light for teams seeking to navigate the complexities of product development...",
            article3_full_title: "Agile Delivery: A Narrative Exploration of Modern Project Management - DISCERN",
            article3_full_text: `<p>In the fast-paced realm of contemporary project management, where adaptability and responsiveness are paramount, Agile Delivery emerges as a guiding light for teams seeking to navigate the complexities of product development. Picture a bustling office space, where teams huddle around whiteboards adorned with colorful sticky notes, engaging in lively discussions and collaborative problem-solving sessions. This is the heart of Agile Delivery—a dynamic approach that emphasizes iterative development, customer collaboration, and flexibility.</p>
                <p>In the world of Agile Delivery, projects are not monolithic endeavors but rather journeys of continuous discovery and refinement. Imagine a team embarking on a new software development project. Instead of meticulously outlining every detail in a lengthy plan, they start with a broad vision and break it down into smaller, more manageable pieces. These pieces, known as iterations or sprints, typically last one to four weeks and culminate in a tangible product increment.</p>
                <p>The magic of Agile Delivery lies in its iterative nature. With each sprint, the team delivers a working prototype or feature, inviting feedback from stakeholders and end-users. This feedback loop is crucial, allowing the team to course-correct, refine their approach, and adapt to changing requirements or market conditions. It's akin to a sculptor shaping clay—each iteration brings the project closer to its final form, guided by continuous refinement and improvement.</p>
                <p>But Agile Delivery is more than just a methodology; it's a mindset—a way of thinking that values collaboration, customer-centricity, and adaptability. Picture a team meeting where developers, designers, and product managers gather to discuss the latest sprint. Ideas flow freely, and everyone has a seat at the table, contributing their unique perspectives and insights. This collaborative spirit fosters creativity and innovation, empowering teams to tackle challenges head-on and find creative solutions.</p>
                <p>At the heart of Agile Delivery is a relentless focus on the customer. Instead of working in isolation and delivering a final product months or even years down the line, Agile teams engage with customers early and often, soliciting feedback and incorporating it into their work. This customer-centric approach ensures that the product meets the needs and expectations of its intended audience, driving satisfaction and loyalty.</p>
                <p>One of the most significant benefits of Agile Delivery is its ability to accelerate time-to-market. By breaking the project into smaller, more manageable chunks and delivering value incrementally, teams can respond quickly to changing market dynamics and emerging opportunities. This agility gives organizations a competitive edge, allowing them to stay ahead of the curve and delight customers with timely innovations.</p>
                <p>But Agile Delivery is not without its challenges. It requires a shift in mindset, culture, and processes—a willingness to embrace uncertainty, iterate quickly, and learn from failure. It also requires strong leadership and a supportive organizational culture that values experimentation and continuous improvement.</p>
                <p>As Agile Delivery continues to gain momentum, organizations must invest in training, coaching, and support to ensure its successful adoption. By embracing Agile principles and practices, teams can unlock new levels of collaboration, innovation, and customer value, driving success in an increasingly complex and dynamic business landscape.</p>`,

            // Article 4
            article4_title: "How AI is Reshaping the World of Human Programmers",
            article4_summary_short: "For decades, the image of the programmer was one of solitary focus: headphones on, bathed in the glow of multiple monitors, fingers flying across a keyboard in a complex dance of logic and syntax...",
            article4_full_title: "How AI is Reshaping the World of Human Programmers - DISCERN",
            article4_full_text: `<p>For decades, the image of the programmer was one of solitary focus: headphones on, bathed in the glow of multiple monitors, fingers flying across a keyboard in a complex dance of logic and syntax. They were the architects and translators, coaxing intricate behaviours out of inert silicon. But a new presence is entering that focused space, not with a physical form, but as a persistent whisper in the code editor, an intelligent echo anticipating the next line – the ghost in the machine is learning to code alongside us, and it's changing everything.</p>
                <p>This isn't the stuff of science fiction anymore. Tools like GitHub Copilot, Tabnine, and Amazon CodeWhisperer have moved from experimental curiosities to daily companions for millions of developers. Integrated directly into the familiar landscape of the Integrated Development Environment (IDE), these AI assistants watch, learn, and offer suggestions with startling speed and relevance. It begins subtly: autocompleting a variable name, then suggesting an entire line, and soon, offering whole functions or complex algorithms based merely on a comment describing the desired outcome.</p>
                <p>The immediate sensation for many programmers is one of acceleration. The drudgery that often bogs down development – writing boilerplate code, implementing standard algorithms, crafting repetitive unit tests – suddenly evaporates. What might have taken thirty minutes of careful typing and cross-referencing can now materialize in seconds, summoned by a well-phrased comment or the context of the surrounding code. This frees up precious cognitive bandwidth, allowing developers to stay focused on the bigger picture: the core logic, the architectural design, the novel challenges that truly require human ingenuity. The flow state, that elusive zone of peak productivity, becomes easier to achieve and maintain when the mundane friction is smoothed away by an AI partner.</p>
                <p>For those navigating the steep learning curves of new languages or frameworks, these AI tools act as interactive guides, far more dynamic than static documentation. They provide syntactically correct examples in real-time, bridging the often-frustrating gap between understanding a concept and actually implementing it. It's like having a patient, knowledgeable tutor constantly available, offering suggestions and reducing the intimidation factor that can discourage newcomers.</p>
                <p>But the AI's influence stretches beyond mere code generation. It's becoming a partner in debugging, analyzing complex error messages and suggesting potential fixes. It can peer into dense blocks of code and identify potential performance bottlenecks, offering more efficient alternatives. It assists in the often-neglected art of documentation, parsing code and comments to generate coherent explanations. It can even help untangle legacy systems or translate code between languages, tasks previously demanding significant human effort.</p>
                <p>This evolving relationship inevitably reshapes the skillset required of a human programmer. The emphasis shifts subtly but significantly. Memorizing exact syntax becomes less critical when an AI can instantly provide it. Instead, the value lies higher up the chain: in clearly defining the problem, in designing robust and scalable systems, in understanding the intricate business logic, and crucially, in critically evaluating the AI's output.</p>
                <p>Because the AI, for all its power, is not infallible. It learns from vast datasets of existing code, inheriting its strengths, weaknesses, biases, and occasionally, its security flaws. The human programmer transforms into a discerning editor, a vigilant gatekeeper. Their role becomes less about laying every single brick and more about being the architect who designs the blueprint, inspects the materials, and ensures the structural integrity of the final build. The art of "prompt engineering" – learning how to effectively communicate intent to the AI to get the desired result – emerges as a vital new skill.</p>
                <p>Of course, there are anxieties. Will over-reliance dull fundamental skills, particularly for junior developers? How do we navigate the murky waters of intellectual property when code is co-created with an AI? Can we trust the security and ethical implications of AI-generated logic? These are not trivial questions, and they demand ongoing attention and responsible development practices.</p>
                <p>Yet, the overwhelming narrative emerging from the trenches of software development is not one of replacement, but of augmentation. AI is not sidelining the programmer; it's evolving their role into something potentially more creative and impactful. It's handling the repetitive tasks, acting as an tireless assistant, and freeing humans to focus on the aspects of software creation that require intuition, ethical judgment, complex problem-solving, and genuine understanding.</p>
                <p>The solitary coder is becoming less common. In their place emerges the programmer as a conductor, orchestrating human insight and artificial intelligence to build software faster, smarter, and perhaps, better than ever before. The ghost in the machine isn't haunting the programmer; it's becoming their indispensable, albeit invisible, partner in the intricate dance of creation.</p>`,

            // Article 5
            article5_title: "The Real Cost of 'Operational Debt': How Weak Processes Erode Your Profit",
            article5_summary_short: "In the IT world, all executives understand the concept of Technical Debt—the shortcuts in code that cost us later. But what happens when that same lack of rigor is applied to business processes? Operational Debt (OD) emerges...",
            article5_full_title: "The Real Cost of 'Operational Debt': How Weak Processes Erode Your Profit - DISCERN",
            article5_full_text: `<p>In the IT world, all executives understand the concept of Technical Debt—the shortcuts in code that cost us later. But what happens when that same lack of rigor is applied to business processes?</p>
                <p>Operational Debt (OD) emerges. This is a silent problem, far more costly than any software bug, because it directly erodes productivity and profit margins. If your business is growing but efficiency is stagnant, you are facing massive Operational Debt.</p>
                <br></br>
                <h3>What exactly is Operational Debt (OD)?</h3>
                <p>Operational Debt is the sum of all tactical, ad-hoc decisions that become major bottlenecks once the workload doubles.</p>
                <p>OD manifests through:</p>
                <ul>
                    <li><strong>Email and Excel-Based Communication:</strong> Critical processes that rely on unstructured files and the collective memory of employees.</li>
                    <li><strong>Lack of an Internal Project Management Framework:</strong> Complex projects are managed reactively, not proactively.</li>
                    <li><strong>Approvals That Take Days:</strong> Manual workflows, without automation, that frustrate employees.</li>
                </ul>
                <p>OD is not a problem of lack of effort, but a problem of lack of process architecture. Every minute lost on a manual task is unearned profit.</p>
                <br></br>
                <h3>Impact in Figures: How Operational Debt Becomes a Bottomless Pit</h3>
                <p>If not addressed, Operational Debt translates directly into measurable losses:</p>
                <ul>
                    <li><strong>Rework and Errors:</strong> Without clear procedures (WBSs, flow diagrams), the team spends between 15% and 25% of their time redoing work.</li>
                    <li><strong>Cost of Stress and Fluctuation:</strong> Employees are frustrated by the lack of clarity and repetitive tasks. Frustration generates errors and, ultimately, high costs.</li>
                    <li><strong>Contractual Losses:</strong> In complex projects, lack of discipline (vague management of dependencies and priorities) leads to missed deadlines and, in the most severe cases, to financial penalties or even loss of clients.</li>
                </ul>
                <br></br>
                <h3>The Solution: Transitioning from Chaos to System (The Three-Pillar Method)</h3>
                <p>The solution consists of a rigorous approach centered on three pillars:</p>
                <ul>
                    <li><strong>Rigorous Process Architecture:</strong> Using the structure of Project Management and logic, a simple but robust process framework is designed. Steps are not added; redundant ones are eliminated, establishing a single source of truth.</li>
                    <li><strong>High-Impact Automation:</strong> Repetitive tasks (manual workload) are identified and automated, freeing up team capacity for value-added tasks.</li>
                    <li><strong>Predictable Delivery:</strong> Clear mechanisms for scope control and communication are established, ensuring projects stay on track, guaranteeing execution on time and on budget.</li>
                </ul>
                <p>If you have recently felt that your business is "harder" than it should be, or that your team is frustrated by internal bureaucracy, you are most likely suffering from massive Operational Debt.</p>
                <p><strong>Don't let weak processes steal your profit!</strong></p>`,
        },
        ro: {
            site_title: "DISCERN - Bun Venit",
            business_name: "DISCERN",
            nav_home: "Acasă",
            nav_about: "Despre Noi",
            nav_services: "Servicii",
            nav_articles: "Articole",
            nav_contact: "Contact",
            nav_location: "Locație",
            hero_title: "DISCERN",
            hero_subtitle: "TRANSFORMĂ HAOSUL OPERAȚIONAL ÎN PROFIT PREDICTIBIL",
            hero_cta: "Contactează-ne",
            about_title: "Despre Noi",
            about_text: "Într-o lume în continuă mișcare, gestionarea eficientă a livrărilor este cheia pentru a rămâne cu un pas înaintea concurenței. Abordarea noastră combină agilitatea, optimizarea și integrarea tehnologiilor avansate pentru a asigura livrări fără întreruperi și eficiență maximă. Colaborând cu noi, vei beneficia de operațiuni simplificate, clienți mulțumiți și un avantaj clar pe piață. Hai să optimizăm împreună strategia ta de livrare și să ducem afacerea ta către noi culmi ale succesului.",
            services_title: "Serviciile Noastre",
            service1_title: "Arhitectură Operațională și Optimizarea Profitului",
            service1_desc: "Expertiză in gestionarea operațiunilor complexe. Rezolvăm haosul, stabilim o arhitectură de proces riguroasă și optimizăm fluxurile de lucru pentru a garanta marje de profit predictibile.",
            service2_title: "Automatizare cu Impact și Transformare Digitală",
            service2_desc: "Soluții digitale personalizate, concepute pentru eficiență. Implementăm automatizări pentru a elimina activitatile redundante, a maximiza capacitatea echipei și a reduce riscul operațional la nivelul întregii companii.",
            service3_title: "Redresarea și Livrarea Predictibilă a Proiectelor",
            service3_desc: "Abordare structurată pentru recuperarea proiectelor complexe, aflate în deriva. Implementăm un control riguros al scopului și metode de aliniere continuă pentru a asigura execuția în timp, în buget și orientată pe valoare adaugată.",
            contact_title: "Contactează-ne",
            contact_prompt: "Ai întrebări? Vrei să discuți un proiect? Trimite-ne un mesaj!",
            form_name: "Nume:",
            form_email: "Email:",
            form_phone: "Telefon:",
            form_message: "Mesaj:",
            form_send: "Trimite Mesajul",
            form_sending: "Se trimite...",
            form_success: "Mesaj trimis cu succes! Vom reveni în curând.",
            form_error: "A apărut o eroare. Vă rugăm să încercați din nou.",
            form_fill_all: "Vă rugăm să completați corect toate câmpurile.",
            location_title: "Locația Noastră",
            location_hours: "Program:",
            footer_text: "© 2026 DISCERN. Toate Drepturile Rezervate.",
            popup_phone_title: "Numărul nostru de contact:",
            articles_page_title: "Articole - DISCERN",
            articles_title: "Ultimele Articole",
            back_to_articles: "\u2190 Înapoi la Articole",

            // Article 1
            article1_title: "Calculul Cuantic: O Călătorie către Realizări de Neimaginat",
            article1_summary_short: "Timp de decenii, ideea calculului cuantic a existat doar în mintea teoreticienilor și fizicienilor care au îndrăznit să viseze...",
            article1_full_title: "Calculul Cuantic: O Călătorie către Realizări de Neimaginat - DISCERN",
            article1_full_text: `<p>Timp de decenii, ideea calculului cuantic a existat doar în mintea teoreticienilor și fizicienilor care au îndrăznit să viseze. Domeniul a început ca un experiment mental îndrăzneț, explorând ce s-ar putea întâmpla dacă regulile enigmatice ale mecanicii cuantice ar fi valorificate pentru calcul. Spre deosebire de computerele clasice, limitate la procesarea informațiilor în sistem binar, adică zero și unu, computerele cuantice promiteau ceva mult mai extraordinar. Qubiții lor, care funcționează într-o suprapunere de stări, pot efectua calcule prin explorarea simultană a multiplelor posibilități, oferind astfel salturi exponențiale în puterea de calcul.</p>
                <p>Călătoria de la teorie la realizări tangibile a fost anevoioasă, dar fascinantă. Una dintre primele descoperiri majore a avut loc atunci când oamenii de știință au construit circuite cuantice funcționale, componentele fundamentale ale calculului cuantic. Deși primitive după standardele de astăzi, aceste circuite au demonstrat că qubiții pot fi manipulați și măsurați, confirmând fezabilitatea calculului cuantic.</p>
                <p>În 2019, Google a făcut furori cu ceea ce a numit „supremație cuantică.” Folosind procesorul său cuantic Sycamore, cu 53 de qubiți, Google a realizat un calcul în 200 de secunde, care ar fi durat mii de ani pe cel mai puternic supercomputer din lume. Deși experimentul nu a rezolvat o problemă din lumea reală, a demonstrat potențialul enorm al calculului cuantic, marcând un moment istoric în acest domeniu.</p>
                <p>O altă realizare remarcabilă constă în criptografia cuantică și căutarea securității imposibil de spart. Valorificând principiile cuantice, cercetătorii au dezvoltat sisteme în care datele sunt transmise cu o confidențialitate absolută. Dacă cineva încearcă să intervină asupra acestor transmisii, simplul act de observare perturbă starea cuantică, făcând intervenția detectabilă instantaneu. Această tehnologie este deja testată pentru comunicații sigure în sectoare precum finanțele și apărare.</p>
                <p>Calculul cuantic a început, de asemenea, să dezlege misterele naturii. Chimie și știința materialelor sunt domenii notorii pentru provocările lor computaționale. Modelarea comportamentului moleculelor sau proiectarea de compuși noi depășește capacitățile supercomputerelor clasice din cauza numărului vast de variabile implicate. În 2020, echipa IBM a simulat comportamentul unei molecule mici, deschizând calea pentru descoperiri în dezvoltarea medicamentelor, energia regenerabilă și chiar superconductorii.</p>
                <p>Poate una dintre cele mai inspiraționale povești provine din rezolvarea problemelor de optimizare, acele puzzle-uri complexe care necesită găsirea celei mai bune soluții dintre nenumărate posibilități. De la logistica în lanțul de aprovizionare până la gestionarea portofoliilor financiare, algoritmii cuantici au arătat un potențial imens în abordarea acestor probleme. Companiile aeriene ar putea optimiza traseele de zbor, reducând întârzierile și consumul de combustibil, în timp ce instituțiile financiare ar putea dezvolta strategii care să minimizeze riscurile cu o precizie fără precedent.</p>
                <p>Însă drumul către realizările actuale ale calculului cuantic nu a fost lipsit de obstacole. Qubiții, vedetele spectacolului cuantic, sunt notorii pentru instabilitatea lor. Sunt sensibili chiar și la cele mai mici perturbații de mediu. Un foton rătăcit sau un firicel de căldură le poate afecta starea. Totuși, prin ani de inovație, oamenii de știință au găsit modalități de a extinde timpii lor de coerență și de a reduce erorile. Sistemele de răcire sofisticate, care funcționează la temperaturi mai scăzute decât cele din spațiul cosmic, au devenit standard în laboratoarele cuantice ale giganților precum IBM, Google și Rigetti Computing.</p>
                <p>Pe măsură ce aceste realizări se adună, calculul cuantic continuă să stârnească entuziasm și curiozitate. Guvernele investesc miliarde în cercetarea cuantică, în timp ce companiile private se întrec pentru a construi primul computer cuantic. Aplicațiile potențiale par infinite: rezolvarea schimbărilor climatice prin modelarea mai bună a sistemelor meteorologice, revoluționarea inteligenței artificiale prin accelerarea proceselor de învățare automată și atingerea unor noi niveluri de eficiență în toate domeniile, de la transporturi la sănătate.</p>
                <p>Totuși, cea mai remarcabilă realizare a calculului cuantic s-ar putea să nu fie un calcul sau o aplicație specifică. Este schimbarea de paradigmă pe care o reprezintă. Calculul cuantic provoacă omenirea să gândească diferit, să accepte o lume în care imposibilul devine posibil. Ne amintește că universul funcționează după reguli la fel de misterioase pe cât sunt de frumoase și că înțelegerea acestor reguli poate deschide capabilități extraordinare.</p>
                <p>În deceniile ce vor urma, calculul cuantic va realiza, fără îndoială, lucruri care astăzi par de neconceput. Dar, deocamdată, reprezintă un testament al ingeniozității umane, o dovadă al a ceea ce putem realiza atunci când curiozitatea se întâlnește cu perseverența. Revoluția cuantică a început, iar realizările ei abia acum se desfășoară.</p>`,

            // Article 2
            article2_title: "Înțelegerea Managementului de Proiect: Cheia Ducerii Afacerii Tale la Următorul Nivel",
            article2_summary_short: "Managementul de proiect este o abordare sistematică privind planificarea, organizarea, executarea și monitorizarea sarcinilor și resurselor pentru a atinge obiective specifice într-un cadru de timp și buget definit...",
            article2_full_title: "Înțelegerea Managementului de Proiect: Cheia Ducerii Afacerii Tale la Următorul Nivel - DISCERN",
            article2_full_text: `<p>Managementul de proiect este o abordare sistematică privind planificarea, organizarea, executarea și monitorizarea sarcinilor și resurselor pentru a atinge obiective specifice într-un cadru de timp și buget definit. Este o disciplină critică care asigură finalizarea proiectelor eficient, la timp și în limitele stabilite.</p>
                <p>La baza sa, managementul de proiect implică alinierea strategică a resurselor, inclusiv echipe, timp și finanțe, pentru a livra rezultate tangibile care să îndeplinească așteptările părților interesate. Înglobează o gamă largă de activități, de la definirea obiectivelor proiectului și descompunera activitatilor până la programarea sarcinilor, gestionarea riscurilor și comunicarea progresului.</p>
                <p>Unul dintre principiile fundamentale ale managementului de proiect este stabilirea unor obiective clare. Acestea furnizează o viziune pentru echipa de proiect, ghidându-le eforturile și ajutându-i să se concentreze pe rezultatele dorite. Managerii de proiect eficienți excelază în stabilirea așteptărilor realiste, echilibrând prioritățile concurente și adaptându-se la schimbări pe măsură ce apar.</p>
                <p>Comunicarea este un alt aspect cheie al managementului de proiect. Comunicarea clară și frecventă ajută la asigurarea faptului că toți cei implicați în proiect înțeleg rolurile și responsabilitățile lor, precum și orice modificări ale scopului sau calendarului proiectului. Ea încurajează colaborarea, minimizează neînțelegerile și promovează o cultură a responsabilității și transparenței.</p>
                <p>Managementul de proiect de succes necesită o combinație de abilități tehnice, cum ar fi bugetarea și planificarea, precum și abilități interpersonale, cum ar fi leadership-ul și rezolvarea conflictelor. Prin folosirea metodologiilor și practicilor dovedite, managerii de proiect pot naviga prin provocările complexe și pot livra rezultate care conduc la succesul organizațional.</p>
                <p>În cele din urmă, managementul de proiect eficient este esențial pentru atingerea obiectivelor strategice, optimizarea resurselor și menținerea unui avantaj competitiv în mediul de afaceri dinamic de astăzi.</p>`,

            // Article 3
            article3_title: "Livrare Agilă: O Explorare Narativă a Managementului Modern de Proiect",
            article3_summary_short: "În contextul managementului de proiect contemporan, unde adaptabilitatea și receptivitatea sunt esențiale, Livrarea Agila (Agile Delivery) apare ca o lumină călăuzitoare pentru echipele care doresc să navigheze cu succes în lumea dezvoltarii de produs...",
            article3_full_title: "Livrare Agilă: O Explorare Narativă a Managementului Modern de Proiect - DISCERN",
            article3_full_text: `<p>În contextul managementului de proiect contemporan, unde adaptabilitatea și receptivitatea sunt esențiale, Livrarea Agila (Agile Delivery) apare ca o lumină călăuzitoare pentru echipele care doresc să navigheze cu succes în lumea dezvoltarii de produs. Imaginează-ți un spațiu de birou plin de viață, în care echipele se înghesuie în jurul tablelor albe încarcate cu note lipicioase colorate, angajându-se în discuții pline de viață și sesiuni colaborative de rezolvare a problemelor. Aceasta este inima Agile Delivery — o abordare dinamică care pune accent pe dezvoltarea iterativă, colaborarea cu clienții și flexibilitate.</p>
                <p>În lumea Agile Delivery, proiectele nu sunt eforturi monolitice, ci mai degrabă călătorii de descoperire și rafinare continuă. Imaginați-vă o echipă care se angajează într-un nou proiect de dezvoltare software. În loc să sublinieze meticulos fiecare detaliu într-un plan lung, ei încep cu o viziune amplă și o descompun în bucăți mai mici și mai ușor de gestionat. Aceste piese, cunoscute sub numele de iterații sau sprinturi, durează de obicei între una și patru săptămâni și culminează cu o iteratie tangibilă a produsului.</p>
                <p>Magia Agile Delivery constă în natura sa iterativă. La fiecare sprint, echipa oferă un prototip sau o funcție funcțională, solicitand feedback de la părțile interesate și de la utilizatorii finali. Această buclă de feedback este crucială, permițând echipei să corecteze cursul, să-și rafineze abordarea și să se adapteze la cerințele în schimbare sau la condițiile pieței. Este asemănător cu un sculptor care modelează argila - fiecare iterație aduce proiectul mai aproape de forma sa finală, ghidat de rafinament și îmbunătățire continuă.</p>
                <p>Dar Agile Delivery este mai mult decât o simplă metodologie; este o stare de spirit – un mod de a gândi care apreciază colaborarea, centrarea pe client și adaptabilitatea. Imaginează-ți o întâlnire de echipă în care dezvoltatorii, designerii și managerii de produs se adună pentru a discuta despre cel mai recent sprint. Ideile curg liber și toată lumea are un loc la masă, contribuind cu perspectivele și intuițiile lor unice. Acest spirit de colaborare stimulează creativitatea și inovația, dând putere echipelor să facă față provocărilor și să găsească soluții creative.</p>
                <p>În centrul Agile Delivery se află o concentrare neîntreruptă asupra clientului. În loc să lucreze izolat și să livreze un produs final în luni sau chiar ani, echipele Agile interacționează cu clienții devreme și frecvent, solicitând feedback și încorporându-l în activitatea lor. Această abordare centrată pe client asigură că produsul îndeplinește nevoile și așteptările publicului vizat, generând satisfacție și loialitate.</p>
                <p>Unul dintre cele mai semnificative beneficii ale Agile Delivery este capacitatea sa de a accelera time-to-market. Împărțind proiectul în bucăți mai mici, mai ușor de gestionat și oferind valoare treptat, echipele pot răspunde rapid dinamicii pieței în schimbare și oportunităților emergente. Această agilitate oferă organizațiilor un avantaj competitiv, permițându-le să rămână în fruntea curbei și să încânte clienții cu inovații în timp util.</p>
                <p>Dar Agile Delivery nu este lipsită de provocări. Este nevoie de o schimbare a mentalității, a culturii și a proceselor - dorința de a accepta incertitudinea, de a repeta rapid și de a învăța din eșec. De asemenea, necesită un lider puternic și o cultură organizațională care prețuiește experimentarea și îmbunătățirea continuă.</p>
                <p>Pe măsură ce Agile Delivery continuă să câștige teren, organizațiile trebuie să investească în instruire, coaching și sprijin pentru a asigura adoptarea cu succes a acesteia. Prin abordarea principiilor și practicilor Agile, echipele pot debloca noi niveluri de colaborare, inovație și valoare pentru clienți, asigurând succesul într-un peisaj de afaceri din ce în ce mai complex și dinamic.</p>`,

            // Article 4
            article4_title: "Cum Inteligența Artificială Transformă Lumea Programatorilor ",
            article4_summary_short: "Timp de decenii, imaginea programatorului a fost una de concentrare solitară: căști pe urechi, scăldat în lumina monitoarelor multiple, degete zburând pe tastatură într-un dans complex de logică și sintaxă...",
            article4_full_title: "Cum Inteligența Artificială Transformă Lumea Programatorilor - DISCERN",
            article4_full_text: `<p>Timp de decenii, imaginea programatorului a fost una de concentrare solitară: căști pe urechi, scăldat în lumina monitoarelor multiple, degete zburând pe tastatură într-un dans complex de logică și sintaxă. Ei erau arhitecții și traducătorii, convingând siliciul inert să adopte comportamente complexe. Dar o nouă prezență pătrunde în acel spațiu concentrat, nu cu o formă fizică, ci ca o șoaptă persistentă în editorul de cod, un ecou inteligent anticipând următoarea linie – fantoma din mașinărie învață să codeze alături de noi și schimbă totul.</p>
                <p>Aceasta nu mai este de domeniul science-fiction-ului. Unelte precum GitHub Copilot, Tabnine și Amazon CodeWhisperer au trecut de la curiozități experimentale la companioni zilnici pentru milioane de dezvoltatori. Integrați direct în peisajul familiar al Mediului de Dezvoltare Integrat (IDE), acești asistenți AI observă, învață și oferă sugestii cu o viteză și relevanță surprinzătoare. Începe subtil: autocompletând numele unei variabile, apoi sugerând o linie întreagă și, curând, oferind funcții complete sau algoritmi complecși bazați doar pe un comentariu care descrie rezultatul dorit.</p>
                <p>Senzația imediată pentru mulți programatori este una de accelerare. Monotonia care adesea încetinește dezvoltarea – scrierea codului repetitiv (boilerplate), implementarea algoritmilor standard, crearea testelor unitare repetitive – se evaporă brusc. Ceea ce ar fi putut dura treizeci de minute de tastare atentă și verificare încrucișată poate acum să se materializeze în secunde, invocat de un comentariu bine formulat sau de contextul codului înconjurător. Acest lucru eliberează lățime de bandă cognitivă prețioasă, permițând dezvoltatorilor să rămână concentrați pe imaginea de ansamblu: logica de bază, designul arhitectural, provocările inedite care necesită cu adevărat ingeniozitate umană. Starea de flux (flow state), acea zonă evazivă de productivitate maximă, devine mai ușor de atins și menținut atunci când fricțiunea banală este netezită de un partener AI.</p>
                <p>Pentru cei care navighează pe curbele abrupte de învățare ale noilor limbaje sau framework-uri, aceste unelte AI acționează ca ghizi interactivi, mult mai dinamici decât documentația statică. Ele oferă exemple corecte sintactic în timp real, reducând decalajul adesea frustrant dintre înțelegerea unui concept și implementarea sa efectivă. Este ca și cum ai avea un tutore răbdător și informat disponibil constant, oferind sugestii și reducând factorul de intimidare care poate descuraja începătorii.</p>
                <p>Dar influența IA se extinde dincolo de simpla generare de cod. Devine un partener în depanare (debugging), analizând mesaje de eroare complexe și sugerând posibile remedieri. Poate privi în blocuri dense de cod și identifica potențiale blocaje de performanță (bottlenecks), oferind alternative mai eficiente. Asistă în arta adesea neglijată a documentației, analizând codul și comentariile pentru a genera explicații coerente. Poate chiar ajuta la descâlcirea sistemelor legacy (moștenite) sau la traducerea codului între diferite limbaje, sarcini care anterior necesitau un efort uman semnificativ.</p>
                <p>Această relație în evoluție remodelează inevitabil setul de competențe necesar unui programator uman. Accentul se mută subtil, dar semnificativ. Memorarea sintaxei exacte devine mai puțin critică atunci când o IA o poate furniza instantaneu. În schimb, valoarea constă mai sus în lanț: în definirea clară a problemei, în proiectarea sistemelor robuste și scalabile, în înțelegerea logicii complexe de business (a afacerii) și, crucial, în evaluarea critică a rezultatelor IA.</p>
                <p>Pentru că IA, cu toată puterea sa, nu este infailibilă. Învață din seturi vaste de date de cod existent, moștenindu-i punctele forte, slăbiciunile, prejudecățile și, ocazional, vulnerabilitățile de securitate. Programatorul uman se transformă într-un editor exigent, un gardian vigilent. Rolul său devine mai puțin despre a așeza fiecare cărămidă și mai mult despre a fi arhitectul care proiectează planul, inspectează materialele și asigură integritatea structurală a construcției finale. Arta "ingineriei prompturilor" – învățarea modului de a comunica eficient intenția către IA pentru a obține rezultatul dorit – apare ca o nouă abilitate vitală.</p>
                <p>Desigur, există anxietăți. Va eroda dependența excesivă abilitățile fundamentale, în special pentru dezvoltatorii juniori? Cum navigăm în apele tulburi ale proprietății intelectuale atunci când codul este co-creat cu o IA? Putem avea încredere în securitatea și implicațiile etice ale logicii generate de IA? Acestea nu sunt întrebări triviale și necesită atenție continuă și practici de dezvoltare responsabile.</p>
                <p>Cu toate acestea, narativul predominant care reiese din tranșeele dezvoltării software nu este unul de înlocuire, ci de augmentare (amplificare). IA nu marginalizează programatorul; îi evoluează rolul în ceva potențial mai creativ și cu impact mai mare. Se ocupă de sarcinile repetitive, acționând ca un asistent neobosit și eliberând oamenii să se concentreze pe aspectele creației software care necesită intuiție, judecată etică, rezolvare complexă a problemelor și înțelegere autentică.</p>
                <p>Programatorul solitar devine mai puțin comun. În locul său apare programatorul ca dirijor, orchestrând perspicacitatea umană și inteligența artificială pentru a construi software mai rapid, mai inteligent și, poate, mai bun ca niciodată. Fantoma din mașinărie nu bântuie programatorul; devine partenerul său indispensabil, deși invizibil, în dansul complex al creației.</p>`,

            // Article 5
            article5_title: "Costul real al \"Datoriei Operaționale\": Cum procesele slabe îți erodeaza profitul",
            article5_summary_short: "În lumea IT, toți executivii înțeleg conceptul de Datorie Tehnică – scurtăturile din cod care ne costă mai târziu. Dar ce se întâmplă când aceeași lipsă de rigoare se aplică proceselor de business? Apare Datoria Operațională...",
            article5_full_title: "Costul real al \"Datoriei Operaționale\": Cum procesele slabe îți erodeaza profitul - DISCERN",
            article5_full_text: `<p>În lumea IT, toți executivii înțeleg conceptul de Datorie Tehnică – scurtăturile din cod care ne costă mai târziu. Dar ce se întâmplă când aceeași lipsă de rigoare se aplică proceselor de business?</p>
                <p>Apare Datoria Operațională (DO). Aceasta este o problemă silențioasă, mult mai costisitoare decât orice bug software, deoarece ea erodează direct productivitatea și marja de profit. Dacă afacerea dumneavoastră crește, dar eficiența stagnează, vă confruntați cu o Datorie Operațională masivă.</p>
                <br></br>
                <h3>Ce este de fapt Datoria Operațională (DO)?</h3>
                <p>Datoria Operațională reprezintă suma tuturor deciziilor tactice, luate ad-hoc, care devin gâtuiri (bottlenecks) majore odată ce volumul de muncă se dublează.</p>
                <p>DO se manifestă prin:</p>
                <ul>
                    <li><strong>Comunicare pe bază de email și Excel:</strong> Procese critice care depind de fișiere nestructurate și de memoria colectivă a angajaților.</li>
                    <li><strong>Lipsa unui cadru de Project Management intern:</strong> Proiectele complexe sunt gestionate reactiv, nu proactiv.</li>
                    <li><strong>Aprobări care durează zile:</strong> Fluxuri de lucru manuale, fără automatizare, care frustrează angajații.</li>
                </ul>
                <p>DO nu este o problemă de lipsă de efort, ci o problemă de lipsă de arhitectură de proces. Fiecare minut pierdut pe o sarcină manuală este un profit neîncasat.</p>
                <br></br>
                <h3>Impactul în Cifre: Cum Datoria Operațională devine o Găleată Fără Fund</h3>
                <p>Dacă nu este adresată, Datoria Operațională se traduce direct în pierderi măsurabile:</p>
                <ul>
                    <li><strong>Rework și Erori:</strong> Fără proceduri clare (WBS-uri, diagrame de flux), echipa petrece între 15% și 25% din timp refăcând munca.</li>
                    <li><strong>Costul Stresului și Fluctuației:</strong> Angajații sunt frustrați de lipsa de claritate și de sarcinile repetitive. Frustrarea generează erori și, în final, costuri mari.</li>
                    <li><strong>Pierderi Contractuale:</strong> În proiectele complexe, lipsa de disciplină (managementul vag al dependențelor și al priorităților) duce la depășirea termenelor și, în cele mai grave cazuri, la penalizări financiare sau chiar la pierderea clienților.</li>
                </ul>
                <br></br>
                <h3>Soluția: Trecerea de la Haos la Sistem (Metoda celor Trei Piloni)</h3>
                <p>Soluția constă în abordarea riguroasă a trei piloni:</p>
                <ul>
                    <li><strong>Arhitectură de Proces Riguroasă:</strong> Folosind structura de Management de Proiect și logica se proiecteaza un cadru de procese simplu, dar robust. Nu se adauga pași, ci se elimină cei redundanți, stabilind un singur flux de adevăr.</li>
                    <li><strong>Automatizare cu Impact Ridicat:</strong> Se identifică sarcinile repetitive (volumul de muncă manual) și se automatizeaza, eliberând capacitatea echipei pentru sarcini cu valoare adăugată.</li>
                    <li><strong>Livrare Predictibilă:</strong> Se stabilesc mecanisme clare de control al scopului (Scope Control) și de comunicare, astfel încât proiectele să rămână mereu pe șine, asigurând execuția la timp și în buget.</li>
                </ul>
                <p>Dacă ați simțit recent că afacerea dumneavoastră este "mai grea" decât ar trebui să fie sau că echipa dumneavoastră este frustrată de birocrația internă, cel mai probabil suferiți de o Datorie Operațională masivă.</p>
                <p><strong>Nu lăsați procesele slabe să vă fure profitul!</strong></p>`,
        }
    };

    function applyTranslations(lang) {
        const langPack = translations[lang] || translations.en;
        if (!translations[lang]) { lang = 'en'; }
        document.documentElement.lang = lang;
        currentLang = lang;
        try { localStorage.setItem('preferredLang', lang); } catch (e) { console.warn("Could not save language preference.", e); }
        document.querySelectorAll('[data-lang-key]').forEach(elem => {
            const key = elem.getAttribute('data-lang-key');
            const translation = langPack[key];
            if (translation !== undefined) {
                if (key.includes('summary_short') || key.includes('footer_text') || key.includes('about_text') || key.includes('full_text') || (key.startsWith('service') && key.endsWith('desc'))) {
                    elem.innerHTML = translation;
                } else if (elem.tagName === 'TITLE') {
                    document.title = translation;
                } else { elem.textContent = translation; }
            } else { if (document.body.contains(elem)) { console.warn(`Translation key "${key}" not found for language "${currentLang}".`); } }
        });
        // Update active class on ALL language switcher buttons
        document.querySelectorAll('.lang-switch').forEach(sw => {
            sw.classList.toggle('active', sw.getAttribute('data-lang') === currentLang);
        });
    }

    // Add click listeners to ALL language switch buttons using event delegation
    document.addEventListener('click', function(event) {
        const langSwitchLink = event.target.closest('.lang-switch');
        if (langSwitchLink) {
            event.preventDefault();
            const selectedLang = langSwitchLink.getAttribute('data-lang');
            if (selectedLang !== currentLang) {
                applyTranslations(selectedLang);
            }
        }
    });

    // --- Initialize translations on page load ---
    applyTranslations(currentLang);


    // Define globally accessible functions for popup
    function openPopup() {
        const overlay = document.getElementById('phone-popup-overlay');
        if(overlay) overlay.classList.add('visible');
    }
    function closePopup() {
        const overlay = document.getElementById('phone-popup-overlay');
        if(overlay) overlay.classList.remove('visible');
    }

    // --- Phone Popup Handling ---
    const phonePopupOverlay = document.getElementById('phone-popup-overlay');
    const closePopupBtn = document.getElementById('close-popup-btn');

    // Use event delegation for phone popup triggers
    document.addEventListener('click', function(event){
        // Check if the clicked element or its ancestor is a phone trigger
        const phoneTrigger = event.target.closest('.open-phone-popup-trigger');
        if(phoneTrigger) {
            event.preventDefault();
            openPopup();
        }
    });

    if (phonePopupOverlay && closePopupBtn) {
        closePopupBtn.addEventListener('click', closePopup);
        phonePopupOverlay.addEventListener('click', (event) => {
            if (event.target === phonePopupOverlay) closePopup();
        });
        document.addEventListener('keydown', (event) => {
            if (event.key === 'Escape' && phonePopupOverlay.classList.contains('visible')) {
                closePopup();
            }
        });
    } else {
        if (!phonePopupOverlay && document.getElementById('phone-popup-overlay')) console.error("Popup overlay (#phone-popup-overlay) not found!");
        if (!closePopupBtn && document.getElementById('close-popup-btn')) console.error("Close popup button (#close-popup-btn) not found!");
    }

}); // End DOMContentLoaded