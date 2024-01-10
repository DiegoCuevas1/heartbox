const getCSRF = () => {
        return document.cookie
          .split("; ")
          .find((row) => row.startsWith("csrftoken="))
          ?.split("=")[1];
      };

export default getCSRF;
  