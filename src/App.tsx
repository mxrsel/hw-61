import React, { useState, useEffect } from 'react';

const App: React.FC = () => {
    const [countries, setCountries] = useState<{ alpha3Code: string; name: string }[]>([]);
    const [selectedCountry, setSelectedCountry] = useState<string>('');
    const [countryInfo, setCountryInfo] = useState<{
        name: string;
        capital: string;
        population: number;
        borders: string[];
    } | null>(null);

    useEffect(() => {
        const fetchCountries = async () => {
            try {
                const response = await fetch('https://restcountries.com/v2/all?fields=alpha3Code,name');
                const data = await response.json();
                setCountries(data);
            } catch (error) {
                console.error('Ошибка при загрузке', error);
            }
        };
        fetchCountries();
    }, []);

    const getCountryInfo = async () => {
        if (!selectedCountry) {
            setCountryInfo(null);
            return;
        }

        try {
            const response = await fetch(`https://restcountries.com/v2/alpha/${selectedCountry}`);
            const country = await response.json();

            // Получаем имена соседних стран
            const borderCountriesNames = await Promise.all(
                country.borders.map(async (borderCode: string) => {
                    const borderResponse = await fetch(`https://restcountries.com/v2/alpha/${borderCode}`);
                    const borderCountry = await borderResponse.json();
                    return borderCountry.name;
                })
            );

            setCountryInfo({
                name: country.name,
                capital: country.capital,
                population: country.population,
                borders: borderCountriesNames,
            });
        } catch (error) {
            console.error('Ошибка при загрузке информации о стране', error);
        }
    };

    useEffect(() => {
        getCountryInfo(); // Вызываем getCountryInfo при первоначальной загрузке
    }, [selectedCountry]); // Вызываем getCountryInfo при изменении selectedCountry

    const handleCountryChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        setSelectedCountry(event.target.value);
    };

    return (
        <div className="container">
            <div className="countries-list">
                <h2>Список стран</h2>
                <select value={selectedCountry} onChange={handleCountryChange}>
                    <option value="">Выберите страну...</option>
                    {countries.map((country) => (
                        <option key={country.alpha3Code} value={country.alpha3Code}>
                            {country.name}
                        </option>
                    ))}
                </select>
            </div>
            <div className="country-info">
                <h2>Информация о стране</h2>
                {selectedCountry ? (
                    countryInfo ? (
                        <>
                            <p><strong>Название:</strong> {countryInfo.name}</p>
                            <p><strong>Столица:</strong> {countryInfo.capital}</p>
                            <p><strong>Население:</strong> {countryInfo.population.toLocaleString()}</p>
                            <p><strong>Граничит с:</strong> {countryInfo.borders.join(', ')}</p>
                        </>
                    ) : (
                        <p>Загрузка информации...</p>
                    )
                ) : (
                    <p>Выберите страну, чтобы увидеть информацию.</p>
                )}
            </div>
        </div>
    );
};

export default App;
