import swaggerJsdoc from "swagger-jsdoc";

const options = {
    definition:{
        openapi:"3.0.0",
        info:{
            title:"Project Management App API",
            version:"1.0",
            description:"A rest api for a project management app."
        },
        servers:[{
            url: process.env.API_URL || `http://localhost:${process.env.PORT || 8000}`,
            description: "Development server"
        }],
        components: {
            securitySchemes: {
                cookieAuth: {
                    type: "apiKey",
                    in: "cookie",
                    name: "accessToken"
                }
            },
        },
    

    },
    apis: ["./src/routes/*.js"],
}

const swaggerSpec = swaggerJsdoc(options);
export default swaggerSpec;
