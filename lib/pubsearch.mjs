import { JSDOM } from 'jsdom';

export const PubMed = function() {
    this.apiKey         = '717999d72f28ebf75cdbb2e1c980dfb9d909';
    this.baseUrl        = 'https://eutils.ncbi.nlm.nih.gov/entrez/eutils/';
    this.pubMedIDs      = [];
    this.errorMessage   = "";
    this.activity       = "";
}

PubMed.prototype    = {
    constructor:    PubMed,

    ids_get:        async function(query) {
        let status              = false;
        let pubmedIDs           = [];
        this.activity           = "ids_get()";
        const searchUrl         = `${this.baseUrl}esearch.fcgi?db=pubmed&term=${query}&api_key=${this.apiKey}&retmode=json`;
        try {
            const searchResponse    = await fetch(searchUrl);
            const searchData        = await searchResponse.json();
            const pubMedIDs         = searchData.esearchresult.idlist;

            if (pubMedIDs.length === 0) {
                this.errorMessage   = "No publications found for the given query '"
                                        + query + "'";
                ;
            }
            this.pubMedIDs          = pubMedIDs;
            pubmedIDs               = pubMedIDs;
            status                  = true;
            printElements(pubMedIDs, "Found PMID: ");
        } catch (error) {
            this.errorMessage       = "Error in communicating with server: " + error.message;
        }
        return {
            status,
            "return": pubmedIDs
        };
    },

    ids_process:    async function(pubmedIDs) {
        this.activity   = 'ids_process()';
        let status      = false;
        let a_metaData  = [];
        for (const pubMedID of pubmedIDs) {
            process.stderr.write('\r' + `Processing PMID ${pubMedID}...`)
            const metadata      = await this.id_fetchData(pubMedID);
            this.errorMessage   = `Error in processing PMID '${pubMedID}'`;
            if (metadata) {
                a_metaData.push(metadata);
                status          = true;
            }
        }
        process.stderr.write('\r');
        return {
            status,
            "return": a_metaData
        };
    },

    id_fetchData:   async function(id) {
        //  try {
        const fetchURL          = `${this.baseUrl}efetch.fcgi?db=pubmed&id=${id}&retmode=xml&rettype=abstract&api_key=${this.apiKey}`
        const response          = await fetch(fetchURL);
        const xmlText           = await response.text();
        const dom               = new JSDOM(xmlText, {contentType: 'text/xml'});
        const xmlDocument       = dom.window.document;

        const article           = xmlDocument.getElementsByTagName('Article')[0];
        const title             = article.getElementsByTagName('ArticleTitle')[0].textContent;
        const abstract          = abstract_process(article);
        const authors           = authors_stringify(authors_listExtract(article));
        const journal           = article.getElementsByTagName('Journal')[0].getElementsByTagName('Title')[0].textContent;
        const date              = date_process(xmlDocument);
        const pages             = pages_process(article);
        const number            = number_process(xmlDocument);
        const volume            = volume_process(xmlDocument);

        const metadata = {
            id,
            title,
            abstract,
            authors,
            journal,
            pages,
            number,
            volume,
            date,
        };

        return metadata;
        //  } catch (error) {
        //    console.error(`Error fetching metadata for PubMed ID ${pubMedID}: ${error}`);
        //    return null;
        //  }
    },
}

async function printElements(array, prefix = "") {
    for (const element of array) {
        process.stderr.write('\r' + prefix + element);
        await delay(10);
    }
    process.stderr.write('\r' + prefix + array.join(" ") + '\n');
}

function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function authors_stringify(authorsArray) {
    return authorsArray
        .map(author => `${author[1]} ${author[0]}`)
        .join(', ');
}

function number_process(xmlDoc) {
    let number = "";
    try {
        number  = xmlDoc.querySelector('Issue').textContent;
    } catch(error) {
        console.error(`Error in processing number: ${error}`);
    }
    return number;
}

function volume_process(xmlDoc) {
    let vol = "";
    try {
        vol     = xmlDoc.querySelector('Volume').textContent;
    } catch(error) {
        console.error(`Error in processing volume: ${error}`);
    }
    return vol;
}

function pages_process(article) {
    let pages = "";
    try {
        const Pagination    = article.getElementsByTagName('Pagination')[0];
        pages               = Pagination.getElementsByTagName('MedlinePgn')[0].textContent;
        pages               = pages;
    } catch(error) {
        console.error(`Error in processing pages:  ${error}`);
    }
    return pages;
}

function date_process(xmlDocument) {
    let publicationDate     = "";
    try {
        const articleDate   = xmlDocument.querySelector('PubDate');
        let   year          = "";
        let   month         = "";
        try {
            year            = articleDate.getElementsByTagName('Year')[0].textContent;
        } catch(error) {}
        try {
            month           = articleDate.getElementsByTagName('Month')[0].textContent;
        } catch(error) {}
        //const day           = articleDate.getElementsByTagName('Day')[0].textContent;
        //publicationDate     = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
        publicationDate     = `${month.padStart(2, '0')}, ${year}`;
    } catch(error) {
        console.error(`Error in processing date: ${error}`);
    }
    return publicationDate;
}

function abstract_process(article) {
    let abstract = "";
    try {
        const abstractContainer = article.getElementsByTagName('Abstract')[0];
        const abstractText      = abstractContainer.getElementsByTagName('AbstractText')[0].textContent;
        abstract                = abstractText
    } catch(error) {
        console.error('Error in processing Abstract: ', error.message);
    }
    return abstract;
}

function authors_listExtract(article) {
    let authors = "";
    try {
        const authorList        = article.getElementsByTagName('AuthorList')[0];
        const authorsLastName   = Array
                                .from(authorList.getElementsByTagName('LastName'))
                                .map((author) => author.textContent);
        const authorsForeName   = Array
                                .from(authorList.getElementsByTagName('ForeName'))
                                .map((author) => author.textContent);

        authors = authorsLastName.map(function(el, idx) {
            return [el, authorsForeName[idx]];
        });
    } catch(error) {
        authors = [ "Error in parsing authors", error];
        console.error(authors);
    }
    return authors;
}

const field_add = (listElement, value, htmlStyle) => {
    const element       = document.createElement(htmlStyle);
    element.textContent = value;
    listElement.appendChild(element);
    listElement.appendChild(document.createElement('br'));
}

function displayPublications(a_metaData) {
    const resultContainer = document.getElementById('results');

    if(a_metaData.length === 0) {
        resultContainer.innerHTML = '<p>No publications found!</p>';
        return false;
    }
    const ul = document.createElement('ul');
    a_metaData.forEach(publication => {
        const li = document.createElement('li');

        field_add(li, publication.title, 'strong');
        field_add(li, publication.authors, 'strong');
        field_add(li, publication.abstract, 'em');
        field_add(li, publication.journal, 'strong');

        if(publication.volume.length) {
            field_add(li, 'vol: ' + publication.volume, 'em');
        }

        if(publication.number.length) {
            field_add(li, 'num: ' + publication.number, 'em');
        }

        if(publication.pages.length) {
            field_add(li, 'pp: ' + publication.pages, 'em');
        }

        if(publication.publicationDate.length) {
            field_add(li, publication.publicationDate, 'em');
        }

        resultContainer.appendChild(li);
        ul.appendChild(li);
    });
    resultContainer.appendChild(ul);
}

// async function getPublications() {
//     const pubmedInput       = document.getElementById('pubmedInput').value;
//     const searchContainer   = document.getElementById('searching');
//     const searchUrl         = `${baseUrl}esearch.fcgi?db=pubmed&term=${pubmedInput}&api_key=${apiKey}&retmode=json`;

//     searchContainer.innerHTML   = "Searching... Please be patient."
//     try {
//         const searchResponse    = await fetch(searchUrl);
//         const searchData        = await searchResponse.json();
//         const pubMedIDs         = searchData.esearchresult.idlist;

//         if (pubMedIDs.length === 0) {
//             console.log('No publications found for the given query.');
//             searchContainer.innerHTML = "No publications found for query '" + pubmedInput + "'";
//             return;
//         }

//         pubMedIDs.forEach(id => {
//             console.log(id);
//         })
//         searchContainer.innerHTML   = "";
//         publications = await processPubMedIDs(pubMedIDs);
//         displayPublications(publications);
//     } catch (error) {
//         console.error('Error fetching publications:', error.message);
//         searchContainer.innerHTML = 'Error in search: ' + error.message;
//     }
// }

