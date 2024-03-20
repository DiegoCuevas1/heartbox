function sanitize_res_msg(message:string) {
    // Sanitize a response message by removing quotes
    const sanitizedMessage = message.replace(/["']/g, '');
    return sanitizedMessage;
}
export default sanitize_res_msg;