import React from 'react';

import LoanInput from '../../components/LoanInput/LoanInput';

interface LoanState {
    principal: number;
    interestRate: number;
    loanLength: number;
    loanMonthlyPayment: number;
    [key: string]: number;
}

interface CalculatorState {
    loans: Array<LoanState>;
}

class Calculator extends React.Component {
    state: CalculatorState = {
        loans: [
            {
                principal: 0,
                interestRate: 0,
                loanLength: 1,
                loanMonthlyPayment: 0,
            },
        ]
    }

    onChangeInput = (field: string, newValue: number, idx: number) => {
        this.setState((prevState: CalculatorState) => {
            const prevLoan = [...prevState.loans];
            prevLoan[idx][field] = newValue;
            const newLoan = this.calculateMonthlyPayment(prevLoan[idx]);
            prevLoan[idx] = newLoan;
            return { loans: prevLoan };
        })
    }

    calculateMonthlyPayment = (loan: LoanState) => {
        let monthly = loan.principal / loan.loanLength;
        if (loan.interestRate !== 0) {
            const months = loan.loanLength;
            const rate = loan.interestRate / 12;
            const P = loan.principal;
            // const numerator = Math.pow(rate * P * (1 + rate), years);
            const numerator = rate * P;
            // const denominator = Math.pow((1 + rate), months) - 1;
            const denominator = 1 - Math.pow((1 + rate), -months);
            console.log(numerator, denominator, numerator / denominator);

            monthly = numerator / denominator;
        }
        const newLoan = { ...loan };
        newLoan.loanMonthlyPayment = monthly;
        return newLoan;
    }

    addLoan = () => {
        this.setState((prevState: CalculatorState) => (
            {loans: [
                ...prevState.loans,
                {
                    principal: 0,
                    interestRate: 0,
                    loanLength: 1,
                    loanMonthlyPayment: 0, 
                }
            ]}
        ))
    }

    removeLoan = (idx: number) => {
        this.setState((prevState: CalculatorState) => {
            const newLoans = [...prevState.loans];
            newLoans.splice(idx, 1);
            return {loans: newLoans};
        })
    }

    componentDidMount() {
        this.setState((prevState: CalculatorState) => (
            { loans: prevState.loans.map( loan => this.calculateMonthlyPayment(loan) ) })
        )
    }

    render() {
        const loans = this.state.loans;
        return (
            <>
                {loans.map ( (loan, idx) =>
                    <LoanInput
                        key={idx}
                        idx={idx}
                        principal={loan.principal}
                        interestRate={loan.interestRate}
                        loanLength={loan.loanLength}
                        monthlyPayment={loan.loanMonthlyPayment}
                        onChangeInput={this.onChangeInput}
                        removeLoan={this.removeLoan}
                    />
                )}
                <div>Total Monthly Payment: {
                    loans.map(loan => loan.loanMonthlyPayment)
                        .reduce((total, monthly) => total + monthly)
                        .toFixed(2)
                    }</div>
                {/* <div>Total Payment: {(loan.loanMonthlyPayment * loan.loanLength).toFixed(2)}</div> */}
                <button style={{ margin: "10px" }} onClick={this.addLoan}>Add Loan</button>
            </>
        )
    }
}

export default Calculator;