// apps/GeneralChemistry/units/unit1/questions.js

const chapterEQuestions = [
    // =========================================================================
    // OBJECTIVE 1: Classify different types of matter
    // =========================================================================
    {
        objective: "Classify different types of matter",
        question: "A beaker contains a clear, colorless liquid. Upon boiling, all the liquid evaporates leaving behind a white crystalline solid tracking the bottom. How should this original sample be classified?",
        options: ["Pure Element", "Pure Compound", "Homogeneous Mixture", "Heterogeneous Mixture"],
        answer: 2,
        explanation: "The sample is a homogeneous mixture (a solution). Because it appeared uniform throughout but could be separated into distinct components via a physical process (boiling), it cannot be a pure substance.",
        diagramType: null,
        assetType: "image",
        imageUrl: "images/boiling-beaker.jpg",
        imagePlaceholderType: "beaker"
    },
    {
        objective: "Classify different types of matter",
        question: "Which classification best matches the microscopic view shown in the particle diagram below?",
        options: ["Pure Element", "Pure Compound", "Homogeneous Mixture", "Heterogeneous Mixture"],
        answer: 1,
        explanation: "This is a pure compound. The container contains only one type of distinct particle configuration, but each particle consists of two different types of atoms chemically bonded together.",
        diagramType: "compound",
        assetType: "diagram"
    },
    {
        objective: "Classify different types of matter",
        question: "Rocky road ice cream contains visible chunks of chocolate, marshmallows, and nuts distributed unevenly throughout. This is an example of a:",
        options: ["Heterogeneous mixture", "Homogeneous mixture", "Pure element", "Pure compound"],
        answer: 0,
        explanation: "Because the composition varies significantly from one region of the sample to another and the individual components are visually distinct, it is a heterogeneous mixture.",
        diagramType: "hetero_mixture",
        assetType: "image",
        imageUrl: "images/rocky_road.jpg",
        imagePlaceholderType: "mixture"
    },
    {
        objective: "Classify different types of matter",
        question: "A pressurized tank contains pure helium gas. How should the contents of this tank be classified?",
        options: ["Pure Element", "Pure Compound", "Homogeneous Mixture", "Heterogeneous Mixture"],
        answer: 0,
        explanation: "Helium is found on the periodic table as a single type of atom ($\text{He}$) that cannot be broken down into simpler substances by chemical means, making it a pure element.",
        diagramType: null,
        assetType: "image",
        imageUrl: "images/helium_tank.jpg",
        imagePlaceholderType: "gas"
    },
    {
        objective: "Classify different types of matter",
        question: "Clean, thoroughly filtered outdoor air containing an unvarying composition of nitrogen, oxygen, and argon gases is best classified as a:",
        options: ["Heterogeneous mixture", "Homogeneous mixture", "Pure compound", "Pure element"],
        answer: 1,
        explanation: "Filtered air is a mixture of gases that is completely uniform in composition throughout a given sample, making it a homogeneous mixture (also known as a gaseous solution).",
        diagramType: "homo_mixture",
        assetType: "diagram"
    },

    // =========================================================================
    // OBJECTIVE 2: Be able to determine an intrinsic vs. extrinsic property
    // =========================================================================
    {
        objective: "Be able to determine an intrinsic vs. extrinsic property",
        question: "An intrinsic (intensive) property is independent of the amount of substance present. Which of the following is an intrinsic property?",
        options: ["Mass", "Volume", "Total thermal energy content", "Density"],
        answer: 3,
        explanation: "Density is an intrinsic property. Whether you possess a single drop of pure water or an entire swimming pool of water, its density remains exactly $1.00\text{ g/mL}$ at standard conditions.",
        diagramType: null,
        assetType: "image",
        imageUrl: "images/water_density.jpg",
        imagePlaceholderType: "beaker"
    },
    {
        objective: "Be able to determine an intrinsic vs. extrinsic property",
        question: "A student logs the observations below while evaluating a copper wire sample. Which of these records represents an extrinsic (extensive) property?",
        options: ["The sample has a mass of $14.3\text{ grams}$.", "The sample has a characteristic reddish-orange metallic luster.", "The sample melts completely at $1085\text{ }^\circ\text{C}$.", "The electrical conductivity is high."],
        answer: 0,
        explanation: "Mass is an extrinsic property because it scales directly with the quantity or physical size of the specific sample being measured.",
        diagramType: null,
        assetType: "image",
        imageUrl: "images/copper_wire.jpg",
        imagePlaceholderType: "metal"
    },
    {
        objective: "Be able to determine an intrinsic vs. extrinsic property",
        question: "If you take a large block of solid gold and cut it exactly in half, which of the following properties of the gold will change?",
        options: ["Density", "Melting point", "Mass", "Color"],
        answer: 2,
        explanation: "Mass is an extrinsic property, so cutting the block in half divides the mass. Density, melting point, and color are intrinsic properties and remain completely unchanged.",
        diagramType: null,
        assetType: "image",
        imageUrl: "images/gold_bar.jpg",
        imagePlaceholderType: "metal"
    },
    {
        objective: "Be able to determine an intrinsic vs. extrinsic property",
        question: "Which of the following experimental observations represents an intrinsic property of an unknown liquid sample?",
        options: ["The sample has a total volume of $25.0\text{ mL}$.", "The liquid boils completely at $78.4\text{ }^\circ\text{C}$.", "The entire sample weighs $19.7\text{ grams}$.", "The liquid fills a $50\text{-mL}$ Erlenmeyer flask."],
        answer: 1,
        explanation: "Boiling point is intrinsic because it depends entirely on the chemical identity of the substance, not on how much of the liquid is sitting in the container.",
        diagramType: null,
        assetType: "image",
        imageUrl: "images/boiling_point.jpg",
        imagePlaceholderType: "beaker"
    },
    {
        objective: "Be able to determine an intrinsic vs. extrinsic property",
        question: "Extrinsic properties are directly dependent on the size or quantity of a sample. Which of the following features is an extrinsic property?",
        options: ["Temperature", "Volume", "Flammability", "Odor"],
        answer: 1,
        explanation: "Volume is an extrinsic property because adding more of the substance increases the physical space it occupies.",
        diagramType: null,
        assetType: "image",
        imageUrl: "images/volume_measurement.jpg",
        imagePlaceholderType: "cylinder"
    },

    // =========================================================================
    // OBJECTIVE 3: Be able to determine intrinsic and extrinsic properties
    // =========================================================================
    {
        objective: "Be able to determine intrinsic and extrinsic properties",
        question: "Which pairing correctly matches a property classification with its definition and a valid example?",
        options: [
            "Extrinsic: Independent of amount (e.g., Temperature)",
            "Intrinsic: Dependent on amount (e.g., Mass)",
            "Intrinsic: Independent of amount (e.g., Boiling Point)",
            "Extrinsic: Independent of amount (e.g., Volume)"
        ],
        answer: 2,
        explanation: "Intrinsic properties are internal to the chemical identity of the substance and independent of amount, such as boiling point, color, or density.",
        diagramType: null,
        assetType: "none"
    },
    {
        objective: "Be able to determine intrinsic and extrinsic properties",
        question: "A laboratory instructor provides a list of properties: [Mass, Density, Temperature, Volume, Melting Point]. Which group contains ONLY intrinsic properties?",
        options: ["Mass, Volume", "Density, Temperature, Melting Point", "Mass, Density, Volume", "Temperature, Volume, Melting Point"],
        answer: 1,
        explanation: "Density, temperature, and melting point do not change based on how much material you have, making them purely intrinsic.",
        diagramType: null,
        assetType: "none"
    },
    {
        objective: "Be able to determine intrinsic and extrinsic properties",
        question: "A laboratory instructor provides a list of properties: [Mass, Density, Temperature, Volume, Melting Point]. Which group contains ONLY extrinsic properties?",
        options: ["Mass, Volume", "Density, Melting Point", "Mass, Temperature, Volume", "Volume, Melting Point"],
        answer: 0,
        explanation: "Mass and volume are extrinsic properties because they scale directly based on the amount of substance present in the sample.",
        diagramType: null,
        assetType: "none"
    },
    {
        objective: "Be able to determine intrinsic and extrinsic properties",
        question: "If the total quantity of a chemical sample inside a closed vessel is tripled, what happens to its intrinsic properties compared to its extrinsic properties?",
        options: [
            "Both intrinsic and extrinsic properties triple.",
            "Intrinsic properties triple, while extrinsic properties stay constant.",
            "Intrinsic properties stay constant, while certain extrinsic properties triple.",
            "Both intrinsic and extrinsic properties stay constant."
        ],
        answer: 2,
        explanation: "Extrinsic properties (like mass and volume) will scale upward with quantity, whereas intrinsic properties (like density and temperature) remain completely constant.",
        diagramType: "homo_mixture",
        assetType: "diagram"
    },
    {
        objective: "Be able to determine intrinsic and extrinsic properties",
        question: "An engineer wants to identify an unknown metal alloy using an intrinsic property. Which data point from her testing file is useful for identity verification?",
        options: ["The alloy sample is $12.5\text{ centimeters}$ long.", "The alloy sample has a density of $7.87\text{ g/cm}^3$.", "The alloy sample reflects $45\text{ Joules}$ of thermal energy.", "The total surface area of the alloy sample is $24\text{ cm}^2$."],
        answer: 1,
        explanation: "Density is an intrinsic property unique to specific substances, making it highly effective for identifying unknown materials. Length, surface area, and total heat capacities are extrinsic values.",
        diagramType: null,
        assetType: "image",
        imageUrl: "images/metal_alloy.jpg",
        imagePlaceholderType: "metal"
    },

    // =========================================================================
    // OBJECTIVE 4: Understand what energy is and that energy is conserved
    // =========================================================================
    {
        objective: "Understand what energy is and that energy is conserved",
        question: "A water molecule sits tightly bound as solid ice at the top of a waterfall. It melts, drops over the edge, and accelerates downward. Which transformation of energy occurs during the fall?",
        options: ["Potential energy transforms into kinetic energy.", "Kinetic energy transforms into chemical energy.", "Potential energy is completely destroyed.", "Thermal energy transforms into potential energy."],
        answer: 0,
        explanation: "As the water drops, its high initial position (stored gravitational potential energy) decreases while converting directly into motion energy (kinetic energy).",
        diagramType: null,
        assetType: "image",
        imageUrl: "images/waterfall.jpg",
        imagePlaceholderType: "waterfall"
    },
    {
        objective: "Understand what energy is and that energy is conserved",
        question: "According to the Law of Conservation of Energy, which statement is true regarding an exothermic chemical reaction taking place inside an isolated system?",
        options: ["Energy is created by breaking molecular bonds.", "The total energy content of the system remains exactly constant.", "Energy disappears as heat transforms directly into matter.", "The energy of the surroundings decreases to balance internal system gains."],
        answer: 1,
        explanation: "The Law of Conservation of Energy states that energy can neither be created nor destroyed. In an isolated system, total energy remains completely constant; it merely shifts from chemical potential energy to thermal kinetic energy.",
        diagramType: null,
        assetType: "none"
    },
    {
        objective: "Understand what energy is and that energy is conserved",
        question: "Which of the following serves as the most accurate fundamental definition of energy in chemistry?",
        options: ["The total structural mass of a particle configuration.", "The capacity to do work or transfer heat.", "The rate at which a chemical reaction proceeds.", "The physical space occupied by moving molecules."],
        answer: 1,
        explanation: "Energy is fundamentally defined across the physical sciences as the capacity to perform work or to transfer thermal heat.",
        diagramType: null,
        assetType: "none"
    },
    {
        objective: "Understand what energy is and that energy is conserved",
        question: "A rolling billiard ball slows down and eventually comes to a complete stop on a felt table. Given that energy is strictly conserved, what happened to the ball's kinetic energy?",
        options: [
            "The kinetic energy was completely destroyed by friction.",
            "The kinetic energy transformed into chemical potential energy inside the ball.",
            "The kinetic energy converted into thermal energy due to friction against the felt and air.",
            "The kinetic energy transformed back into gravitational potential energy."
        ],
        answer: 2,
        explanation: "Energy cannot vanish. The active motion energy (kinetic energy) of the rolling ball was converted into disorganized thermal energy (heat) via structural friction with the table and air molecules.",
        diagramType: null,
        assetType: "image",
        imageUrl: "images/billiard_table.jpg",
        imagePlaceholderType: "billiard"
    },
    {
        objective: "Understand what energy is and that energy is conserved",
        question: "Where is chemical energy primarily stored within a sample of molecules, such as a fuel source?",
        options: [
            "Within the kinetic motion of the outer electron clouds.",
            "Within the electrostatic attractions and chemical bonds between atoms.",
            "Inside the empty physical space separating distinct molecules.",
            "Directly inside the core structure of individual atomic nuclei."
        ],
        answer: 1,
        explanation: "Chemical energy is a form of potential energy that is stored within the chemical bonds, electrostatic attractions, and structural arrangements of atoms and molecules.",
        diagramType: null,
        assetType: "image",
        imageUrl: "images/chemical_bonds.jpg",
        imagePlaceholderType: "beaker"
    }
];