/**
 * Machine Learning Predictor for Posture Classification
 * Runs a pre-trained Random Forest model exported as JSON.
 */
export class PosturePredictor {
    constructor() {
        this.model = null;
        this.isLoaded = false;
    }

    async loadModel(url) {
        try {
            const response = await fetch(url);
            this.model = await response.json();
            this.isLoaded = true;
            console.log("Posture ML Model loaded successfully:", this.model.classes);
        } catch (error) {
            console.error("Failed to load posture model:", error);
        }
    }

    predict(sensorData) {
        if (!this.isLoaded) return { classId: 0, className: "Loading...", confidence: 0 };

        // sensorData should be an array matching our features:
        // ['Seat_FL', 'Seat_FR', 'Seat_BL', 'Seat_BR', 'Lumbar_L', 'Lumbar_R', 'IMU_Pitch', 'IMU_Roll']
        
        const numClasses = this.model.classes.length;
        const totalProbs = new Array(numClasses).fill(0);

        // Run each tree in the forest
        for (const tree of this.model.forest) {
            const leafProbs = this.traverseTree(tree, sensorData);
            for (let i = 0; i < numClasses; i++) {
                totalProbs[i] += leafProbs[i];
            }
        }

        // Average probabilities across all trees
        const averageProbs = totalProbs.map(p => p / this.model.forest.length);
        
        // Find max probability class
        let maxProb = -1;
        let classId = 0;
        for (let i = 0; i < averageProbs.length; i++) {
            if (averageProbs[i] > maxProb) {
                maxProb = averageProbs[i];
                classId = i;
            }
        }

        return {
            classId: classId,
            className: this.model.classes[classId],
            confidence: maxProb,
            allProbabilities: averageProbs
        };
    }

    traverseTree(node, inputs) {
        if (node.leaf) {
            return node.value;
        }

        const featureValue = inputs[node.feature];
        if (featureValue <= node.threshold) {
            return this.traverseTree(node.left, inputs);
        } else {
            return this.traverseTree(node.right, inputs);
        }
    }
}
