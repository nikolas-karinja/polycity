class Ideology 
{
    constructor (minName, maxName)
    {
        this.minName = minName // extreme-left side of spectrum (0)
        this.maxName = maxName // extreme-right side of spectrum (100)
        this.value = 50 // 0 to 100 (50 is moderate)
    }

    SetValue (value)
    {
        this.value = value
    }
}

class BaseIdeologies
{
    constructor (values = {})
    {
        this.identity = new Ideology("Collectivism", "Individualism")
        this.industry =  new Ideology("Eco-Friendly", "Pro-Industry")
        this.medicine =  new Ideology("Holistic Medicine", "Modern Medicine")
        this.abortion =  new Ideology("Pro-Life", "Pro-Choice")
        this.authority = new Ideology("Anarchy", "Dictatorship")
        this.economy =  new Ideology("Communism", "Capitalism")
        this.religion = new Ideology("Atheist", "Religious")
        this.change = new Ideology("Traditional", "Progressive")
        this.society = new Ideology("Rural", "Urban")
        this.equality = new Ideology("Matriarchy", "Patriarchy")

        for (const v in values)
        {
            this[v].SetValue(values[v])
        }
    }
}

class PoliticalParty
{
    constructor (ideologiesValues = {})
    {
        this.Ideologies = new BaseIdeologies(ideologiesValues)
    }
    
    SetIdeologyValue (name, value)
    {
        this.Ideologies[name].SetValue(value)
    }
}

export { BaseIdeologies, PoliticalParty }